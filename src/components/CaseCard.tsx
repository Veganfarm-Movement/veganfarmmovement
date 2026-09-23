import { Link } from "@tanstack/react-router";

import { CASE_STATUS_LABELS, formatINR, fundingMath } from "@/lib/brand";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export type CaseSummary = {
  slug: string;
  animal_name: string;
  animal_type: string | null;
  location: string | null;
  animal_photo_url: string | null;
  amount_required: number | null;
  amount_raised: number;
  status: string;
};

export function CaseCard({ item }: { item: CaseSummary }) {
  const { percent, remaining } = fundingMath(item.amount_required, item.amount_raised);

  return (
    <Link
      to="/rescue/$slug"
      params={{ slug: item.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.animal_photo_url ? (
          <img
            src={item.animal_photo_url}
            alt={`${item.animal_name} — rescue case photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            Case image not available
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">{item.animal_name}</h3>
            <p className="text-sm text-muted-foreground">
              {[item.animal_type, item.location].filter(Boolean).join(" · ") ||
                "Information will be updated soon."}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {CASE_STATUS_LABELS[item.status] ?? item.status}
          </Badge>
        </div>

        {item.amount_required ? (
          <div className="mt-auto space-y-2">
            <Progress value={percent ?? 0} className="h-2" />
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold text-primary">
                {formatINR(item.amount_raised)} raised
              </span>
              <span className="text-muted-foreground">
                {formatINR(remaining)} remaining of {formatINR(item.amount_required)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-auto text-sm text-muted-foreground">
            Funding information will be updated soon.
          </p>
        )}
      </div>
    </Link>
  );
}
