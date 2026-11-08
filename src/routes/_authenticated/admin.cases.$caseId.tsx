import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/AdminShell";
import { FundingCard } from "@/components/FundingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteCase, adminDeleteExpense, adminDeleteUpdate, adminGetCase,
  adminSaveCase, adminSaveExpense, adminSaveUpdate,
} from "@/lib/admin.functions";
import { CASE_STATUS_LABELS, UPDATE_TYPE_LABELS, formatINR } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/cases/$caseId")({
  head: () => ({ meta: [{ title: "Edit case — VEGANFARM admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <CaseEditor />
    </AdminShell>
  ),
});

type Form = {
  slug: string; animal_name: string; animal_type: string; description: string; location: string;
  animal_photo_url: string | null; poster_url: string | null; medical_bill_url: string | null;
  qr_code_url: string | null; amount_required: string; status: string; is_active: boolean;
};

const EMPTY: Form = {
  slug: "", animal_name: "", animal_type: "", description: "", location: "",
  animal_photo_url: null, poster_url: null, medical_bill_url: null, qr_code_url: null,
  amount_required: "", status: "active", is_active: true,
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function uploadMedia(caseKey: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${caseKey}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("case-media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

function useSigned(path: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return setUrl(null);
    supabase.storage.from("case-media").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);
  return url;
}

function MediaField({ label, path, onChange, caseKey }: { label: string; path: string | null; onChange: (p: string | null) => void; caseKey: string }) {
  const url = useSigned(path);
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-lg border border-border p-3">
      <Label>{label}</Label>
      <div className="mt-2 flex aspect-video items-center justify-center overflow-hidden rounded bg-muted text-xs text-muted-foreground">
        {url ? (path?.endsWith(".pdf") ? <a href={url} target="_blank" rel="noreferrer">Open PDF</a> : <img src={url} alt={label} className="h-full w-full object-cover" />) : "Not uploaded"}
      </div>
      <div className="mt-2 flex gap-2">
        <Input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" disabled={busy} onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          if (f.size > 10 * 1024 * 1024) return toast.error("File must be under 10 MB");
          setBusy(true);
          try { onChange(await uploadMedia(caseKey, f)); toast.success("Uploaded"); } catch { toast.error("Upload failed"); }
          setBusy(false);
        }} />
        {path && <Button type="button" variant="outline" size="sm" onClick={() => onChange(null)}>Remove</Button>}
      </div>
    </div>
  );
}

function CaseEditor() {
  const { caseId } = Route.useParams();
  const isNew = caseId === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetCase);
  const saveFn = useServerFn(adminSaveCase);
  const delFn = useServerFn(adminDeleteCase);
  const q = useQuery({ queryKey: ["admin-case", caseId], queryFn: () => getFn({ data: { caseId } }), enabled: !isNew });
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const c = q.data?.rescueCase;
    if (c) setForm({
      slug: c.slug, animal_name: c.animal_name, animal_type: c.animal_type ?? "", description: c.description ?? "",
      location: c.location ?? "", animal_photo_url: c.animal_photo_url, poster_url: c.poster_url,
      medical_bill_url: c.medical_bill_url, qr_code_url: c.qr_code_url,
      amount_required: c.amount_required?.toString() ?? "", status: c.status, is_active: c.is_active,
    });
  }, [q.data]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const caseKey = isNew ? `draft-${form.slug || "new"}` : caseId;

  async function save() {
    const amt = form.amount_required.trim() ? Number(form.amount_required) : null;
    if (!form.animal_name.trim()) return toast.error("Animal name is required");
    if (amt !== null && (!Number.isFinite(amt) || amt <= 0)) return toast.error("Amount required must be a positive number");
    setSaving(true);
    try {
      const r = await saveFn({ data: {
        id: isNew ? undefined : caseId, slug: form.slug || slugify(form.animal_name), animal_name: form.animal_name,
        animal_type: form.animal_type || null, description: form.description || null, location: form.location || null,
        animal_photo_url: form.animal_photo_url, poster_url: form.poster_url, medical_bill_url: form.medical_bill_url,
        qr_code_url: form.qr_code_url, amount_required: amt, status: form.status as any, is_active: form.is_active,
      } });
      toast.success("Case saved");
      qc.invalidateQueries();
      if (isNew) navigate({ to: "/admin/cases/$caseId", params: { caseId: r.id } });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); }
    setSaving(false);
  }

  if (!isNew && q.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{isNew ? "Create case" : `Edit: ${form.animal_name}`}</h1>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="destructive" onClick={async () => {
              if (!confirm("Permanently delete this case and all its donations, updates and expenses? To keep records, turn off 'Visible on website' instead.")) return;
              await delFn({ data: { caseId } }); qc.invalidateQueries(); navigate({ to: "/admin/cases" });
            }}>Delete</Button>
          )}
          {!isNew && <Button variant="outline" asChild><a href={`/rescue/${form.slug}`} target="_blank" rel="noreferrer">View public page</a></Button>}
          <Button onClick={save} disabled={saving}>Save case</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-card">
          <div><Label>Animal name</Label><Input className="mt-1" value={form.animal_name} onChange={(e) => { set("animal_name", e.target.value); if (isNew) set("slug", slugify(e.target.value)); }} /></div>
          <div><Label>Web address (/rescue/…)</Label><Input className="mt-1" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Animal type</Label><Input className="mt-1" value={form.animal_type} onChange={(e) => set("animal_type", e.target.value)} /></div>
            <div><Label>Location</Label><Input className="mt-1" value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
          </div>
          <div><Label>Amount required (₹)</Label><Input className="mt-1" inputMode="decimal" value={form.amount_required} onChange={(e) => set("amount_required", e.target.value)} /></div>
          <div>
            <Label>Case status</Label>
            <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => set("status", e.target.value)}>
              {Object.entries(CASE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><Label>Visible on website</Label></div>
          <div><Label>Description (factual)</Label><Textarea className="mt-1 min-h-40" value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
        <div className="space-y-4">
          {q.data && <FundingCard amountRequired={q.data.rescueCase.amount_required} amountRaised={q.data.rescueCase.amount_raised} donationCount={q.data.rescueCase.donation_count} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <MediaField label="Animal photo" path={form.animal_photo_url} onChange={(p) => set("animal_photo_url", p)} caseKey={caseKey} />
            <MediaField label="Rescue poster" path={form.poster_url} onChange={(p) => set("poster_url", p)} caseKey={caseKey} />
            <MediaField label="Medical bill / estimate" path={form.medical_bill_url} onChange={(p) => set("medical_bill_url", p)} caseKey={caseKey} />
            <MediaField label="Case QR code (optional — default VEGANFARM QR is used)" path={form.qr_code_url} onChange={(p) => set("qr_code_url", p)} caseKey={caseKey} />
          </div>
          <p className="text-xs text-muted-foreground">Remember to click "Save case" after uploading files.</p>
        </div>
      </div>

      {!isNew && q.data && <UpdatesAndExpenses caseId={caseId} data={q.data} />}
    </div>
  );
}

function UpdatesAndExpenses({ caseId, data }: { caseId: string; data: any }) {
  const qc = useQueryClient();
  const saveUpdate = useServerFn(adminSaveUpdate);
  const delUpdate = useServerFn(adminDeleteUpdate);
  const saveExpense = useServerFn(adminSaveExpense);
  const delExpense = useServerFn(adminDeleteExpense);
  const today = new Date().toISOString().slice(0, 10);
  const [u, setU] = useState({ update_type: "rescue", title: "", description: "", update_date: today, image_url: null as string | null });
  const [ex, setEx] = useState({ label: "", amount: "", expense_date: today });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-case", caseId] });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-lg font-bold">Case updates</h2>
        <div className="mt-3 space-y-3">
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={u.update_type} onChange={(e) => setU({ ...u, update_type: e.target.value })}>
            {Object.entries(UPDATE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Input type="date" value={u.update_date} onChange={(e) => setU({ ...u, update_date: e.target.value })} />
          <Input placeholder="Title" value={u.title} onChange={(e) => setU({ ...u, title: e.target.value })} />
          <Textarea placeholder="Description" value={u.description} onChange={(e) => setU({ ...u, description: e.target.value })} />
          <MediaField label="Optional image" path={u.image_url} onChange={(p) => setU({ ...u, image_url: p })} caseKey={caseId} />
          <Button onClick={async () => {
            if (u.title.trim().length < 2) return toast.error("Title is required");
            await saveUpdate({ data: { case_id: caseId, ...u, update_type: u.update_type as any, description: u.description || null } });
            setU({ ...u, title: "", description: "", image_url: null }); refresh(); toast.success("Update posted");
          }}>Post update</Button>
        </div>
        <ul className="mt-5 space-y-2">
          {data.updates.map((x: any) => (
            <li key={x.id} className="flex items-start justify-between gap-3 rounded border border-border p-3 text-sm">
              <div><p className="font-medium">{x.title}</p><p className="text-xs text-muted-foreground">{UPDATE_TYPE_LABELS[x.update_type]} · {x.update_date}</p></div>
              <Button size="sm" variant="ghost" onClick={async () => { await delUpdate({ data: { id: x.id } }); refresh(); }}>Delete</Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-lg font-bold">Expense records (shown as Fund Utilization)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Input className="sm:col-span-3" placeholder="e.g. Veterinary Consultation" value={ex.label} onChange={(e) => setEx({ ...ex, label: e.target.value })} />
          <Input inputMode="decimal" placeholder="Amount ₹" value={ex.amount} onChange={(e) => setEx({ ...ex, amount: e.target.value })} />
          <Input type="date" value={ex.expense_date} onChange={(e) => setEx({ ...ex, expense_date: e.target.value })} />
          <Button onClick={async () => {
            const amt = Number(ex.amount);
            if (ex.label.trim().length < 2 || !Number.isFinite(amt) || amt < 0) return toast.error("Enter a label and valid amount");
            await saveExpense({ data: { case_id: caseId, label: ex.label, amount: amt, expense_date: ex.expense_date } });
            setEx({ ...ex, label: "", amount: "" }); refresh();
          }}>Add</Button>
        </div>
        <ul className="mt-5 space-y-2">
          {data.expenses.map((x: any) => (
            <li key={x.id} className="flex items-center justify-between rounded border border-border p-3 text-sm">
              <span>{x.label} · {x.expense_date}</span>
              <span className="flex items-center gap-2 font-semibold">{formatINR(x.amount)}
                <Button size="sm" variant="ghost" onClick={async () => { await delExpense({ data: { id: x.id } }); refresh(); }}>Delete</Button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
