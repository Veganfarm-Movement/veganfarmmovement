import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { BRAND, formatINR } from "@/lib/brand";
import { getPlatformStats, listPublicCases } from "@/lib/cases.functions";

const statsQuery = queryOptions({ queryKey: ["public-stats"], queryFn: () => getPlatformStats() });
const casesQuery = queryOptions({ queryKey: ["public-cases"], queryFn: () => listPublicCases() });

export const Route = createFileRoute("/transparency")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(statsQuery),
      context.queryClient.ensureQueryData(casesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Transparency — VEGANFARM Animal Rescue" },
      {
        name: "description",
        content:
          "How VEGANFARM handles donations: verified-only fundraising totals, case documentation, case updates and fund utilisation records.",
      },
      { property: "og:title", content: "Transparency — VEGANFARM Animal Rescue" },
      {
        property: "og:description",
        content: "Verified-only totals, case documentation and fund utilisation records.",
      },
    ],
  }),
  component: Transparency,
});

function Transparency() {
  const { data: stats } = useSuspenseQuery(statsQuery);
  const { data: cases } = useSuspenseQuery(casesQuery);

  return (
    <PublicShell>
      <div className="container-page py-10 md:py-14">
        <p className="eyebrow">Transparency</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">
          How donations are handled
        </h1>

        <div className="mt-6 max-w-3xl rounded-xl border border-border bg-card p-6 shadow-card">
          <p className="text-base leading-relaxed text-foreground">
            {BRAND.name} is currently an independent, unregistered animal-welfare movement. Donations
            collected through this platform are intended for the specific animal/case shown on the
            relevant campaign page. Relevant bills, receipts, and rescue/treatment updates may be
            provided as available.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Active rescue cases" value={String(stats.activeCases)} />
          <Stat label="Total funding required" value={formatINR(stats.totalRequired)} />
          <Stat label="Verified funds raised" value={formatINR(stats.totalRaised)} />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Panel title="Verified donations only">
            A donation is counted only after an administrator confirms the payment. Pending
            submissions and rejected submissions never increase a public fundraising total.
          </Panel>
          <Panel title="Case updates">
            Rescue, treatment, surgery, recovery and closure updates are published on each case page
            as they are recorded. No update is published unless it has actually happened.
          </Panel>
          <Panel title="Fund utilization">
            Where expense records are entered for a case — consultation, medicines, treatment,
            hospitalization or other approved expenses — they appear publicly on that case page.
          </Panel>
          <Panel title="Donor privacy">
            Mobile numbers, payment references and payment screenshots are never shown publicly. They
            are visible only to an authorised administrator for verification.
          </Panel>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-foreground">Case funding records</h2>
        {cases.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Information will be updated soon.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-card">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Case</th>
                  <th className="px-4 py-3 font-semibold">Required</th>
                  <th className="px-4 py-3 font-semibold">Verified raised</th>
                  <th className="px-4 py-3 font-semibold">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.slug} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link
                        to="/rescue/$slug"
                        params={{ slug: c.slug }}
                        className="font-medium text-primary hover:underline"
                      >
                        {c.animal_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatINR(c.amount_required)}</td>
                    <td className="px-4 py-3">{formatINR(c.amount_raised)}</td>
                    <td className="px-4 py-3">
                      {c.amount_required
                        ? formatINR(Math.max(c.amount_required - c.amount_raised, 0))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button asChild className="mt-8 h-12 text-base font-semibold">
          <Link to="/rescue">VIEW RESCUE CASES</Link>
        </Button>
      </div>
    </PublicShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
