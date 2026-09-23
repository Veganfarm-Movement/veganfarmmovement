import { formatINR, fundingMath } from "@/lib/brand";
import { Progress } from "@/components/ui/progress";

export function FundingCard({
  amountRequired,
  amountRaised,
  donationCount,
}: {
  amountRequired: number | null;
  amountRaised: number;
  donationCount?: number;
}) {
  const { remaining, percent } = fundingMath(amountRequired, amountRaised);

  if (!amountRequired) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <p className="eyebrow">Funding</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Funding information will be updated soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="eyebrow">Funding progress</p>
        <p className="text-sm font-semibold text-primary">{percent}% funded</p>
      </div>
      <Progress value={percent ?? 0} className="mt-3 h-3" />
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="eyebrow">Amount required</dt>
          <dd className="mt-1 text-xl font-bold text-foreground">{formatINR(amountRequired)}</dd>
        </div>
        <div>
          <dt className="eyebrow">Amount raised</dt>
          <dd className="mt-1 text-xl font-bold text-primary">{formatINR(amountRaised)}</dd>
        </div>
        <div>
          <dt className="eyebrow">Amount remaining</dt>
          <dd className="mt-1 text-xl font-bold text-foreground">{formatINR(remaining)}</dd>
        </div>
      </dl>
      {typeof donationCount === "number" && (
        <p className="mt-4 text-sm text-muted-foreground">
          {donationCount === 0
            ? "No verified donations recorded yet."
            : `${donationCount} verified donation${donationCount === 1 ? "" : "s"} recorded. Only donations verified by an administrator are counted here.`}
        </p>
      )}
    </div>
  );
}
