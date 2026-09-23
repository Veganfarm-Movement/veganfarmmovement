import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";
import { BRAND, LOGO_URL } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About VEGANFARM — Independent Animal-Welfare Movement" },
      {
        name: "description",
        content:
          "VEGANFARM is an independent, unregistered animal-welfare movement supporting individual animal rescue cases with treatment and emergency care.",
      },
      { property: "og:title", content: "About VEGANFARM — Independent Animal-Welfare Movement" },
      {
        property: "og:description",
        content: "Who we are and how VEGANFARM supports individual rescue cases.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicShell>
      <div className="container-page py-10 md:py-14">
        <img src={LOGO_URL} alt="VEGANFARM logo" width={200} height={200} className="h-16 w-auto" />
        <h1 className="mt-6 text-3xl font-extrabold text-foreground md:text-4xl">
          About {BRAND.name}
        </h1>
        <p className="mt-2 text-base font-semibold text-primary">
          {BRAND.name} — {BRAND.status}
        </p>

        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-foreground">
          <p>
            {BRAND.name} is currently an independent, unregistered animal-welfare movement. We
            support individual animals who need treatment, medical care and emergency help, one case
            at a time.
          </p>
          <p>
            Each campaign on this platform belongs to a single animal. The funding requirement,
            documentation and case updates are entered by an administrator, and only donations
            verified by an administrator are counted towards a case total.
          </p>
          <p className="font-semibold">{BRAND.tagline}</p>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-foreground">Organisational status</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {BRAND.name} is not a registered NGO or registered charity. Donations made through this
            platform are not tax deductible and no 80G receipt is issued.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="h-12 text-base font-semibold">
            <Link to="/rescue">VIEW RESCUE CASES</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-base font-semibold">
            <Link to="/transparency">Transparency</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
