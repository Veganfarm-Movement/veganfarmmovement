import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { HeartHandshake, ReceiptText, ShieldCheck } from "lucide-react";

import { PublicShell } from "@/components/PublicShell";
import { CaseCard } from "@/components/CaseCard";
import { Button } from "@/components/ui/button";
import { BRAND, formatINR } from "@/lib/brand";
import { getPlatformStats, listPublicCases } from "@/lib/cases.functions";

const casesQuery = queryOptions({ queryKey: ["public-cases"], queryFn: () => listPublicCases() });
const statsQuery = queryOptions({ queryKey: ["public-stats"], queryFn: () => getPlatformStats() });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(casesQuery),
      context.queryClient.ensureQueryData(statsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "VEGANFARM Animal Rescue — Help Save A Life" },
      {
        name: "description",
        content:
          "Support individual animal rescue cases with VEGANFARM, an independent animal-welfare movement. See each case, its funding requirement and contribute any amount.",
      },
      { property: "og:title", content: "VEGANFARM Animal Rescue — Help Save A Life" },
      {
        property: "og:description",
        content:
          "Support individual animal rescue cases and help provide treatment, medical care and emergency support.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: cases } = useSuspenseQuery(casesQuery);
  const { data: stats } = useSuspenseQuery(statsQuery);

  return (
    <PublicShell>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-14 text-center md:py-20">
          <p className="eyebrow">
            {BRAND.name} — {BRAND.status}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
            HELP SAVE A LIFE
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-foreground md:text-xl">
            Every contribution can help an animal receive the care it needs.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Support individual rescue cases and help provide treatment, medical care and emergency
            support.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 text-base font-semibold">
              <Link to="/rescue">VIEW RESCUE CASES</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 text-base font-semibold">
              <Link to="/how-it-works">HOW IT WORKS</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-10 sm:grid-cols-3">
        <Stat label="Active rescue cases" value={String(stats.activeCases)} />
        <Stat label="Total funding required" value={formatINR(stats.totalRequired)} />
        <Stat label="Verified donations recorded" value={String(stats.verifiedDonations)} />
      </section>

      <section className="container-page pb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Rescue cases</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
              Animals who need help right now
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/rescue">See all cases</Link>
          </Button>
        </div>

        {cases.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Information will be updated soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.slice(0, 6).map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="container-page py-12">
        <div className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={<HeartHandshake className="h-5 w-5" />}
            title="Case-specific support"
            body="Each campaign page belongs to one animal, with its own funding requirement."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Verified donations only"
            body="Only donations checked and verified by an administrator are added to a case total."
          />
          <Feature
            icon={<ReceiptText className="h-5 w-5" />}
            title="Documents where available"
            body="Rescue posters, bills and estimates are published on the case page when available."
          />
        </div>
      </section>
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

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
        {icon}
      </span>
      <h3 className="mt-3 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
