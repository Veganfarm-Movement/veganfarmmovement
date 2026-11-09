import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CASE_MEDIA_BUCKET = "case-media";
const SIGN_SECONDS = 60 * 60 * 6;

type PublicCase = {
  id: string;
  slug: string;
  animal_name: string;
  animal_type: string | null;
  description: string | null;
  location: string | null;
  animal_photo_url: string | null;
  poster_url: string | null;
  medical_bill_url: string | null;
  qr_code_url: string | null;
  amount_required: number | null;
  amount_raised: number;
  donation_count: number;
  status: string;
  created_at: string;
  updated_at: string;
};

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function signMany(paths: (string | null)[]): Promise<(string | null)[]> {
  const real = paths.filter((p): p is string => !!p);
  if (real.length === 0) return paths.map(() => null);
  const supabase = await adminClient();
  const map = new Map<string, string>();
  await Promise.all(
    real.map(async (path) => {
      if (/^https?:\/\//.test(path)) {
        map.set(path, path);
        return;
      }
      const { data } = await supabase.storage
        .from(CASE_MEDIA_BUCKET)
        .createSignedUrl(path, SIGN_SECONDS);
      if (data?.signedUrl) map.set(path, data.signedUrl);
    }),
  );
  return paths.map((p) => (p ? (map.get(p) ?? null) : null));
}

export const listPublicCases = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("rescue_cases")
    .select(
      "id, slug, animal_name, animal_type, location, animal_photo_url, amount_required, amount_raised, donation_count, status, created_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load rescue cases");

  const signed = await signMany((data ?? []).map((c) => c.animal_photo_url));
  return (data ?? []).map((c, i) => ({
    ...c,
    amount_raised: Number(c.amount_raised ?? 0),
    amount_required: c.amount_required === null ? null : Number(c.amount_required),
    animal_photo_url: signed[i] ?? null,
  }));
});

export const getPublicCase = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = await adminClient();
    const { data: row, error } = await supabase
      .from("rescue_cases")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error("Unable to load this rescue case");
    if (!row) return null;

    const [photo, poster, bill, qr] = await signMany([
      row.animal_photo_url,
      row.poster_url,
      row.medical_bill_url,
      row.qr_code_url,
    ]);

    const [{ data: updates }, { data: expenses }] = await Promise.all([
      supabase
        .from("case_updates")
        .select("id, update_type, title, description, image_url, update_date")
        .eq("case_id", row.id)
        .order("update_date", { ascending: false }),
      supabase
        .from("case_expenses")
        .select("id, label, amount, expense_date")
        .eq("case_id", row.id)
        .order("expense_date", { ascending: true }),
    ]);

    const updateImages = await signMany((updates ?? []).map((u) => u.image_url));

    const rescueCase: PublicCase = {
      ...(row as PublicCase),
      amount_raised: Number(row.amount_raised ?? 0),
      amount_required: row.amount_required === null ? null : Number(row.amount_required),
      animal_photo_url: photo ?? null,
      poster_url: poster ?? null,
      medical_bill_url: bill ?? null,
      qr_code_url: qr ?? null,
    };

    return {
      rescueCase,
      updates: (updates ?? []).map((u, i) => ({ ...u, image_url: updateImages[i] ?? null })),
      expenses: (expenses ?? []).map((e) => ({ ...e, amount: Number(e.amount) })),
    };
  });

export const getPlatformStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await adminClient();
  const { data, error } = await supabase
    .from("rescue_cases")
    .select("status, amount_required, amount_raised, donation_count")
    .eq("is_active", true);
  if (error) throw new Error("Unable to load statistics");
  const rows = data ?? [];
  return {
    activeCases: rows.filter((r) => r.status !== "closed").length,
    totalRequired: rows.reduce((s, r) => s + Number(r.amount_required ?? 0), 0),
    totalRaised: rows.reduce((s, r) => s + Number(r.amount_raised ?? 0), 0),
    verifiedDonations: rows.reduce((s, r) => s + Number(r.donation_count ?? 0), 0),
  };
});
