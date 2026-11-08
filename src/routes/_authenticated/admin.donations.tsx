import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AdminShell } from "@/components/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminGetDonationProof, adminListDonations, adminSetDonationStatus } from "@/lib/admin.functions";
import { formatINR } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/donations")({
  head: () => ({ meta: [{ title: "Donations — VEGANFARM admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <Donations />
    </AdminShell>
  ),
});

const STATUS_LABEL: Record<string, string> = { pending: "Pending Verification", verified: "Verified", rejected: "Rejected" };

function Donations() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListDonations);
  const proofFn = useServerFn(adminGetDonationProof);
  const statusFn = useServerFn(adminSetDonationStatus);
  const { data } = useQuery({ queryKey: ["admin-donations"], queryFn: () => listFn() });
  const [filter, setFilter] = useState("all");
  const [viewing, setViewing] = useState<any>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<any>(null);
  const [rejecting, setRejecting] = useState<any>(null);
  const [reason, setReason] = useState("");

  async function open(d: any) {
    setViewing(d); setProofUrl(null);
    const r = await proofFn({ data: { donationId: d.id } });
    setProofUrl(r.url);
  }
  async function setStatus(id: string, status: "verified" | "rejected", adminNotes?: string) {
    try {
      await statusFn({ data: { donationId: id, status, adminNotes } });
      toast.success(status === "verified" ? "Donation verified" : "Donation rejected");
      qc.invalidateQueries();
    } catch { toast.error("Something went wrong. Please try again."); }
  }

  const rows = (data ?? []).filter((d) => filter === "all" || d.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Donations</h1>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option><option value="pending">Pending</option>
          <option value="verified">Verified</option><option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface text-left">
            <tr>{["Donor", "Case", "Amount", "UTR", "Status", "Date", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((d: any) => (
              <tr key={d.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{d.donor_name}<div className="text-xs text-muted-foreground">{d.reference_id}</div></td>
                <td className="px-4 py-3">{d.rescue_cases?.animal_name}</td>
                <td className="px-4 py-3 font-semibold">{formatINR(d.amount)}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.payment_reference}</td>
                <td className="px-4 py-3"><Badge variant={d.status === "verified" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>{STATUS_LABEL[d.status]}</Badge></td>
                <td className="px-4 py-3 text-xs">{new Date(d.created_at).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => open(d)}>View</Button>
                    {d.status !== "verified" && <Button size="sm" onClick={() => setVerifying(d)}>Verify</Button>}
                    {d.status !== "rejected" && <Button size="sm" variant="destructive" onClick={() => { setReason(""); setRejecting(d); }}>Reject</Button>}
                  </div>
                </td>
              </tr>
            ))}
            {data && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No donations.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Donation {viewing?.reference_id}</DialogTitle></DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Donor</dt><dd>{viewing.donor_name}</dd>
              <dt className="text-muted-foreground">Mobile</dt><dd>{viewing.mobile_number}</dd>
              <dt className="text-muted-foreground">Case</dt><dd>{viewing.rescue_cases?.animal_name}</dd>
              <dt className="text-muted-foreground">Amount</dt><dd>{formatINR(viewing.amount)}</dd>
              <dt className="text-muted-foreground">UTR</dt><dd className="font-mono">{viewing.payment_reference}</dd>
              <dt className="text-muted-foreground">Status</dt><dd>{STATUS_LABEL[viewing.status]}</dd>
              <dt className="text-muted-foreground">Submitted</dt><dd>{new Date(viewing.created_at).toLocaleString("en-IN")}</dd>
              {viewing.verified_at && (<><dt className="text-muted-foreground">Verified</dt><dd>{new Date(viewing.verified_at).toLocaleString("en-IN")}</dd></>)}
              {viewing.admin_notes && (<><dt className="text-muted-foreground">Admin notes</dt><dd>{viewing.admin_notes}</dd></>)}
            </dl>
          )}
          <div className="mt-3">
            {proofUrl ? (
              <a href={proofUrl} target="_blank" rel="noreferrer">
                <img src={proofUrl} alt="Payment screenshot" className="max-h-[60vh] w-full rounded border border-border object-contain" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                <span className="mt-2 block text-sm text-primary underline">Open screenshot in new tab</span>
              </a>
            ) : <p className="text-sm text-muted-foreground">Loading screenshot…</p>}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!verifying} onOpenChange={(o) => !o && setVerifying(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>VERIFY DONATION</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this donation? {verifying && `${formatINR(verifying.amount)} from ${verifying.donor_name} (UTR ${verifying.payment_reference}) will be added to the case total.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setStatus(verifying.id, "verified"); setVerifying(null); }}>CONFIRM VERIFICATION</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject donation</AlertDialogTitle>
            <AlertDialogDescription>Rejected donations never count toward the case total. Add an optional reason.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea placeholder="e.g. Payment reference could not be verified." value={reason} onChange={(e) => setReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { setStatus(rejecting.id, "rejected", reason || undefined); setRejecting(null); }}>Reject donation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
