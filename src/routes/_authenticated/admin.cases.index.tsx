import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminShell } from "@/components/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminListCases } from "@/lib/admin.functions";
import { CASE_STATUS_LABELS, formatINR, fundingMath } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/cases/")({
  head: () => ({ meta: [{ title: "Cases — VEGANFARM admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminShell>
      <CasesList />
    </AdminShell>
  ),
});

function CasesList() {
  const fn = useServerFn(adminListCases);
  const { data } = useQuery({ queryKey: ["admin-cases"], queryFn: () => fn() });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rescue cases</h1>
        <Button asChild>
          <Link to="/admin/cases/$caseId" params={{ caseId: "new" }}>Create case</Link>
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Case</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Required</th><th className="px-4 py-3">Raised</th>
              <th className="px-4 py-3">Progress</th><th className="px-4 py-3">Visible</th><th />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => {
              const m = fundingMath(c.amount_required, c.amount_raised);
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{c.animal_name}<div className="text-xs text-muted-foreground">/rescue/{c.slug}</div></td>
                  <td className="px-4 py-3"><Badge variant="secondary">{CASE_STATUS_LABELS[c.status]}</Badge></td>
                  <td className="px-4 py-3">{formatINR(c.amount_required)}</td>
                  <td className="px-4 py-3">{formatINR(c.amount_raised)}</td>
                  <td className="px-4 py-3">{m.percent === null ? "—" : `${m.percent}%`}</td>
                  <td className="px-4 py-3">{c.is_active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/cases/$caseId" params={{ caseId: c.id }}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
            {data && data.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No cases yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
