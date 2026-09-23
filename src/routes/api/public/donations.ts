import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
const MAX_BYTES = 8 * 1024 * 1024;

const schema = z.object({
  caseId: z.string().uuid(),
  donorName: z.string().trim().min(2).max(120),
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,16}$/),
  amount: z.coerce.number().positive().max(10_000_000),
  paymentReference: z.string().trim().min(4).max(60),
});

function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/donations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return fail("Something went wrong. Please try again.");
        }

        const parsed = schema.safeParse({
          caseId: form.get("caseId"),
          donorName: form.get("donorName"),
          mobileNumber: form.get("mobileNumber"),
          amount: form.get("amount"),
          paymentReference: form.get("paymentReference"),
        });
        if (!parsed.success) {
          return fail("Please check the details you entered and try again.");
        }
        const input = parsed.data;

        const file = form.get("screenshot");
        if (!(file instanceof File) || file.size === 0) {
          return fail("Please upload your payment screenshot.");
        }
        if (file.size > MAX_BYTES) {
          return fail("Please upload a file smaller than 8 MB.");
        }
        if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
          return fail("Please upload a JPG, PNG, WEBP or PDF file.");
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: rescueCase } = await supabaseAdmin
          .from("rescue_cases")
          .select("id, is_active")
          .eq("id", input.caseId)
          .maybeSingle();
        if (!rescueCase || !rescueCase.is_active) {
          return fail("This rescue case is no longer accepting donations.");
        }

        const { data: duplicate } = await supabaseAdmin
          .from("donations")
          .select("id")
          .eq("case_id", input.caseId)
          .eq("payment_reference", input.paymentReference)
          .maybeSingle();
        if (duplicate) {
          return fail("This payment reference has already been submitted for this case.");
        }

        const { count: recent } = await supabaseAdmin
          .from("donations")
          .select("id", { count: "exact", head: true })
          .eq("mobile_number", input.mobileNumber)
          .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
        if ((recent ?? 0) >= 5) {
          return fail("Too many submissions. Please try again in a few minutes.", 429);
        }

        const { data: refData, error: refError } = await supabaseAdmin.rpc(
          "next_donation_reference",
        );
        if (refError || !refData) {
          return fail("Something went wrong. Please try again.", 500);
        }
        const referenceId = refData as unknown as string;

        const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
        const path = `${input.caseId}/${referenceId}.${ext}`;
        const upload = await supabaseAdmin.storage
          .from("donation-proofs")
          .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
        if (upload.error) {
          return fail("We could not upload your screenshot. Please try again.", 500);
        }

        const { error: insertError } = await supabaseAdmin.from("donations").insert({
          reference_id: referenceId,
          case_id: input.caseId,
          donor_name: input.donorName,
          mobile_number: input.mobileNumber,
          amount: input.amount,
          payment_reference: input.paymentReference,
          screenshot_path: path,
          status: "pending",
        });
        if (insertError) {
          return fail("Something went wrong. Please try again.", 500);
        }

        return Response.json({ ok: true, referenceId });
      },
    },
  },
});
