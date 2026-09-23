import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

import { PublicShell } from "@/components/PublicShell";
import { FundingCard } from "@/components/FundingCard";
import { DonationSection } from "@/components/DonationSection";
import { ShareCase } from "@/components/ShareCase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CASE_STATUS_LABELS, UPDATE_TYPE_LABELS, formatINR } from "@/lib/brand";
import { getPublicCase } from "@/lib/cases.functions";

const caseQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-case", slug],
    queryFn: () => getPublicCase({ data: { slug } }),
  });

export const Route = createFileRoute("/rescue/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(caseQuery(params.slug));
    if (!data) throw notFound();
    return { animalName: data.rescueCase.animal_name, location: data.rescueCase.location };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Rescue case unavailable — VEGANFARM" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Help ${loaderData.animalName} — VEGANFARM Animal Rescue`;
    const description = `Support the rescue case of ${loaderData.animalName}${
      loaderData.location ? ` in ${loaderData.location}` : ""
    }. See the case details, funding requirement and how to contribute.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: CaseNotFound,
  errorComponent: CaseError,
  component: CaseDetail,
});

function CaseDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(caseQuery(slug));
  if (!data) return <CaseNotFound />;
  const { rescueCase: c, updates, expenses } = data;

  const gallery = [
    { url: c.animal_photo_url, label: "Animal photo" },
    { url: c.poster_url, label: "Rescue case poster" },
    { url: c.medical_bill_url, label: "Medical bill / estimate" },
  ].filter((item) => Boolean(item.url));

  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <PublicShell>
      <div className="container-page py-8 md:py-12">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{CASE_STATUS_LABELS[c.status] ?? c.status}</Badge>
          {c.animal_type && <span className="text-sm text-muted-foreground">{c.animal_type}</span>}
          {c.location && <span className="text-sm text-muted-foreground">· {c.location}</span>}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-foreground md:text-5xl">HELP SAVE A LIFE</h1>
        <p className="mt-2 text-xl font-semibold text-foreground md:text-2xl">{c.animal_name}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              {c.animal_photo_url ? (
                <img
                  src={c.animal_photo_url}
                  alt={`${c.animal_name} — rescue case photo`}
                  className="max-h-[560px] w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                  Case image not available
                </div>
              )}
            </div>

            {gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">CASE DOCUMENTATION</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {gallery.map((item) => (
                    <a
                      key={item.label}
                      href={item.url!}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-lg border border-border bg-card shadow-card"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        {item.url!.toLowerCase().includes(".pdf") ? (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <FileText className="h-8 w-8" />
                            <span className="text-xs">Open PDF</span>
                          </div>
                        ) : (
                          <img
                            src={item.url!}
                            alt={`${c.animal_name} — ${item.label}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                      <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {item.label}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-foreground">ABOUT THIS CASE</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground">
                {c.description?.trim() || "Information will be updated soon."}
              </p>
            </div>

            {updates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">CASE UPDATES</h2>
                <ol className="mt-4 space-y-4">
                  {updates.map((u) => (
                    <li key={u.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {UPDATE_TYPE_LABELS[u.update_type] ?? u.update_type}
                        </Badge>
                        <time className="text-sm text-muted-foreground">{u.update_date}</time>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{u.title}</h3>
                      {u.description && (
                        <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                          {u.description}
                        </p>
                      )}
                      {u.image_url && (
                        <img
                          src={u.image_url}
                          alt={u.title}
                          loading="lazy"
                          className="mt-3 max-h-80 w-full rounded-lg object-cover"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {expenses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground">FUND UTILIZATION</h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-card">
                  <table className="w-full text-sm">
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-foreground">{e.label}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {e.expense_date}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            {formatINR(e.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-surface">
                        <td className="px-4 py-3 font-semibold text-foreground" colSpan={2}>
                          Total recorded expenses
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {formatINR(expenseTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-40 lg:self-start">
            <FundingCard
              amountRequired={c.amount_required}
              amountRaised={c.amount_raised}
              donationCount={c.donation_count}
            />
            <Button asChild className="h-12 w-full text-base font-semibold">
              <a href="#donate">Donate to {c.animal_name}</a>
            </Button>
            <ShareCase animalName={c.animal_name} slug={c.slug} />
          </aside>
        </div>

        <div className="mt-10 lg:max-w-3xl">
          <DonationSection caseId={c.id} animalName={c.animal_name} qrCodeUrl={c.qr_code_url} />
        </div>
      </div>
    </PublicShell>
  );
}

function CaseNotFound() {
  return (
    <PublicShell>
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Rescue case not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This case may have been closed or the link may be incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link to="/rescue">View all rescue cases</Link>
        </Button>
      </div>
    </PublicShell>
  );
}

function CaseError() {
  return (
    <PublicShell>
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <Button asChild className="mt-6">
          <Link to="/rescue">View all rescue cases</Link>
        </Button>
      </div>
    </PublicShell>
  );
}
