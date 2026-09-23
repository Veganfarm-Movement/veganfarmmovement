import logoAsset from "@/assets/veganfarm-logo.png.asset.json";
import qrAsset from "@/assets/veganfarm-upi-qr.png.asset.json";

export const LOGO_URL = logoAsset.url;
export const DONATION_QR_URL = qrAsset.url;

export const BRAND = {
  name: "VEGANFARM",
  status: "Independent Animal-Welfare Movement",
  tagline: "For Animals. For Life.",
} as const;

export const CASE_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  treatment_ongoing: "Treatment Ongoing",
  funding_complete: "Funding Complete",
  recovery: "Recovery",
  closed: "Closed",
};

export const UPDATE_TYPE_LABELS: Record<string, string> = {
  rescue: "Rescue update",
  treatment: "Treatment update",
  surgery: "Surgery update",
  recovery: "Recovery update",
  closure: "Closure update",
};

export function formatINR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function fundingMath(required: number | null, raised: number) {
  if (!required || required <= 0) {
    return { required: null, raised, remaining: null, percent: null };
  }
  const remaining = Math.max(required - raised, 0);
  const percent = Math.min(100, Math.round((raised / required) * 100));
  return { required, raised, remaining, percent };
}
