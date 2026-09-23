import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { PublicShell } from "@/components/PublicShell";
import { CaseCard } from "@/components/CaseCard";
import { listPublicCases } from "@/lib/cases.functions";

const casesQuery = queryOptions({ queryKey: ["public-cases"], queryFn: () => listPublicCases() });

export const Route = createFileRoute("/rescue")({
  loader: ({ context }) => context.queryClient.ensureQueryData(casesQuery),
  head: () => ({
    meta: [
      { title: "Rescue Cases — VEGANFARM Animal Rescue" },
      {
        name: "description",
        content:
          "Browse current VEGANFARM animal rescue cases, their funding requirements and how much has been verified so far.",
      },
      { property: "og:title", content: "Rescue Cases — VEGANFARM Animal Rescue" },
      {
        property: "og:description",
        content: "Browse current animal rescue cases and support the one you choose.",
      },
    ],
  }),
  component: RescueList,
});

function RescueList() {
  const { data: cases } = useSuspenseQuery(casesQuery);

  return (
    <PublicShell>
      <div className="container-page py-10 md:py-14">
        <p className="eyebrow">Rescue cases</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">HELP SAVE A LIFE</h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Every case below belongs to one animal. Open a case to see its documentation, funding
          requirement and donation details.
        </p>

        {cases.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Information will be updated soon.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
