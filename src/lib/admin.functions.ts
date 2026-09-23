import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

/** Signed-in user asks whether they are an administrator. */
export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

/** Bootstrap: the first signed-in account becomes the administrator. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await admin();
    const { count } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false };
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error("Unable to set up the administrator account");
    return { granted: true };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const [{ data: cases }, { data: donations }] = await Promise.all([
      supabase.from("rescue_cases").select("status, is_active, amount_required, amount_raised"),
      supabase.from("donations").select("status, amount"),
    ]);
    const rows = cases ?? [];
    const dons = donations ?? [];
    const sum = (status: string) =>
      dons.filter((d) => d.status === status).reduce((s, d) => s + Number(d.amount), 0);
    return {
      activeCases: rows.filter((c) => c.is_active && c.status !== "closed").length,
      completedCases: rows.filter((c) => c.status === "funding_complete" || c.status === "closed")
        .length,
      totalRequired: rows.reduce((s, c) => s + Number(c.amount_required ?? 0), 0),
      totalRaised: rows.reduce((s, c) => s + Number(c.amount_raised ?? 0), 0),
      verifiedCount: dons.filter((d) => d.status === "verified").length,
      verifiedAmount: sum("verified"),
      pendingCount: dons.filter((d) => d.status === "pending").length,
      pendingAmount: sum("pending"),
      rejectedCount: dons.filter((d) => d.status === "rejected").length,
    };
  });

export const adminListCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { data, error } = await supabase
      .from("rescue_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Unable to load cases");
    return (data ?? []).map((c) => ({
      ...c,
      amount_raised: Number(c.amount_raised ?? 0),
      amount_required: c.amount_required === null ? null : Number(c.amount_required),
    }));
  });

export const adminGetCase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => z.object({ caseId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const [{ data: row }, { data: updates }, { data: expenses }] = await Promise.all([
      supabase.from("rescue_cases").select("*").eq("id", data.caseId).maybeSingle(),
      supabase
        .from("case_updates")
        .select("*")
        .eq("case_id", data.caseId)
        .order("update_date", { ascending: false }),
      supabase
        .from("case_expenses")
        .select("*")
        .eq("case_id", data.caseId)
        .order("expense_date", { ascending: true }),
    ]);
    if (!row) throw new Error("Case not found");
    return {
      rescueCase: {
        ...row,
        amount_raised: Number(row.amount_raised ?? 0),
        amount_required: row.amount_required === null ? null : Number(row.amount_required),
      },
      updates: updates ?? [],
      expenses: (expenses ?? []).map((e) => ({ ...e, amount: Number(e.amount) })),
    };
  });

const caseSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes only"),
  animal_name: z.string().trim().min(1).max(120),
  animal_type: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(8000).nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
  animal_photo_url: z.string().nullable().optional(),
  poster_url: z.string().nullable().optional(),
  medical_bill_url: z.string().nullable().optional(),
  qr_code_url: z.string().nullable().optional(),
  amount_required: z.number().positive().nullable().optional(),
  status: z.enum(["active", "treatment_ongoing", "funding_complete", "recovery", "closed"]),
  is_active: z.boolean(),
});

export const adminSaveCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => caseSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { id, ...fields } = data;
    if (id) {
      const { error } = await supabase.from("rescue_cases").update(fields).eq("id", id);
      if (error) throw new Error("Unable to save this case. The web address may already be used.");
      return { id };
    }
    const { data: created, error } = await supabase
      .from("rescue_cases")
      .insert(fields)
      .select("id")
      .single();
    if (error) throw new Error("Unable to create this case. The web address may already be used.");
    return { id: created.id as string };
  });

export const adminDeleteCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => z.object({ caseId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { error } = await supabase.from("rescue_cases").delete().eq("id", data.caseId);
    if (error) throw new Error("Unable to delete this case");
    return { ok: true };
  });

export const adminListDonations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { data, error } = await supabase
      .from("donations")
      .select(
        "id, reference_id, case_id, donor_name, mobile_number, amount, payment_reference, status, admin_notes, created_at, verified_at, rescue_cases(animal_name, slug)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error("Unable to load donations");
    return (data ?? []).map((d) => ({ ...d, amount: Number(d.amount) }));
  });

export const adminGetDonationProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { donationId: string }) =>
    z.object({ donationId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { data: row } = await supabase
      .from("donations")
      .select("screenshot_path")
      .eq("id", data.donationId)
      .maybeSingle();
    if (!row?.screenshot_path) return { url: null };
    const { data: signed } = await supabase.storage
      .from("donation-proofs")
      .createSignedUrl(row.screenshot_path, 60 * 10);
    return { url: signed?.signedUrl ?? null };
  });

export const adminSetDonationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        donationId: z.string().uuid(),
        status: z.enum(["pending", "verified", "rejected"]),
        adminNotes: z.string().trim().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { error } = await supabase
      .from("donations")
      .update({
        status: data.status,
        admin_notes: data.adminNotes ?? null,
        verified_at: data.status === "verified" ? new Date().toISOString() : null,
        verified_by: data.status === "verified" ? context.userId : null,
      })
      .eq("id", data.donationId);
    if (error) throw new Error("Unable to update this donation");
    return { ok: true };
  });

export const adminSaveUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        case_id: z.string().uuid(),
        update_type: z.enum(["rescue", "treatment", "surgery", "recovery", "closure"]),
        title: z.string().trim().min(2).max(160),
        description: z.string().trim().max(4000).nullable().optional(),
        image_url: z.string().nullable().optional(),
        update_date: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { error } = await supabase.from("case_updates").insert(data);
    if (error) throw new Error("Unable to save this update");
    return { ok: true };
  });

export const adminDeleteUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    await supabase.from("case_updates").delete().eq("id", data.id);
    return { ok: true };
  });

export const adminSaveExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        case_id: z.string().uuid(),
        label: z.string().trim().min(2).max(160),
        amount: z.number().nonnegative(),
        expense_date: z.string(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    const { error } = await supabase.from("case_expenses").insert(data);
    if (error) throw new Error("Unable to save this expense");
    return { ok: true };
  });

export const adminDeleteExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabase = await admin();
    await supabase.from("case_expenses").delete().eq("id", data.id);
    return { ok: true };
  });
