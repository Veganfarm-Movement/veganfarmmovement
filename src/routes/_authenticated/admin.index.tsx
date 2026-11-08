import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminShell } from "@/components/AdminShell";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatINR } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin dashboard — VEGANFARM" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AdminShell>
      <Overview />
    </AdminShell>
  );
}

function Overview() {
  const fn = useServerFn(getAdminOverview);
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const items = [
    ["Total active cases", String(data.activeCases)],
    ["Total amount required", formatINR(data.totalRequired)],
    ["Total verified donations", `${data.verifiedCount} · ${formatINR(data.verifiedAmount)}`],
    ["Total pending donations", `${data.pendingCount} · ${formatINR(data.pendingAmount)}`],
    ["Total completed cases", String(data.completedCases)],
    ["Rejected submissions", String(data.rejectedCount)],
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="eyebrow">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
