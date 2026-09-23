import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { BRAND, DONATION_QR_URL, formatINR } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Errors = Partial<Record<"donorName" | "mobileNumber" | "amount" | "reference" | "file", string>>;

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

export function DonationSection({
  caseId,
  animalName,
  qrCodeUrl,
}: {
  caseId: string;
  animalName: string;
  qrCodeUrl?: string | null;
}) {
  const [donorName, setDonorName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ referenceId: string; amount: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const next: Errors = {};
    if (donorName.trim().length < 2) next.donorName = "Please enter your name.";
    if (!/^[0-9+\-\s]{8,16}$/.test(mobileNumber.trim()))
      next.mobileNumber = "Please enter a valid mobile number.";
    const numeric = Number(amount);
    if (!amount.trim() || !Number.isFinite(numeric) || numeric <= 0)
      next.amount = "Please enter a valid donation amount.";
    if (reference.trim().length < 4) next.reference = "Please enter your payment reference.";
    if (!file) next.file = "Please upload your payment screenshot.";
    else if (!ALLOWED.includes(file.type)) next.file = "Please upload a JPG, PNG, WEBP or PDF file.";
    else if (file.size > 8 * 1024 * 1024) next.file = "Please upload a file smaller than 8 MB.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    const form = new FormData();
    form.set("caseId", caseId);
    form.set("donorName", donorName.trim());
    form.set("mobileNumber", mobileNumber.trim());
    form.set("amount", String(Number(amount)));
    form.set("paymentReference", reference.trim());
    form.set("screenshot", file!);

    setSubmitting(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/public/donations");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setSubmitting(false);
      try {
        const body = JSON.parse(xhr.responseText) as {
          ok: boolean;
          referenceId?: string;
          message?: string;
        };
        if (xhr.status === 200 && body.ok && body.referenceId) {
          setResult({ referenceId: body.referenceId, amount: Number(amount) });
          return;
        }
        setFormError(body.message ?? "Something went wrong. Please try again.");
      } catch {
        setFormError("Something went wrong. Please try again.");
      }
    };
    xhr.onerror = () => {
      setSubmitting(false);
      setFormError("Something went wrong. Please try again.");
    };
    xhr.send(form);
  }

  if (result) {
    return (
      <section id="donate" className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
          <h2 className="text-2xl font-bold text-foreground">THANK YOU SO MUCH</h2>
        </div>
        <p className="mt-3 text-base text-foreground">
          Your donation details have been submitted successfully.
        </p>
        <p className="mt-2 text-base text-muted-foreground">
          Your contribution has been recorded and is currently pending verification.
        </p>

        <div className="mt-5 rounded-lg border border-border bg-primary-soft p-4">
          <p className="eyebrow">Your donation reference</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {result.referenceId}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Amount submitted: {formatINR(result.amount)} · For {animalName}. Please keep this
            reference for any future communication.
          </p>
        </div>

        <p className="mt-5 text-base text-foreground">
          Because of your kindness, we can give animals like this a chance to survive, heal and live.
        </p>
        <p className="mt-2 text-base font-semibold text-foreground">Your help truly matters.</p>
        <p className="mt-4 text-sm font-bold text-primary">
          {BRAND.name} — {BRAND.tagline}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" className="min-h-11" onClick={() => window.print()}>
            Download / print confirmation
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          This confirmation records your submission only. It is not a tax receipt.
        </p>
      </section>
    );
  }

  return (
    <section id="donate" className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-2xl font-bold text-foreground">SUPPORT THIS ANIMAL</h2>
        <p className="mt-2 text-base text-muted-foreground">
          You can contribute any amount you wish. Every contribution can help provide the care this
          animal needs.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <p className="eyebrow">Scan to donate</p>
          <img
            src={qrCodeUrl || DONATION_QR_URL}
            alt="VEGANFARM donation QR code — scan with any UPI app"
            width={720}
            height={1440}
            className="mt-3 w-full max-w-[320px] rounded-lg border border-border"
          />
          <p className="mt-4 max-w-xl text-center text-sm text-muted-foreground">
            After completing your payment, enter your payment details below so the donation can be
            recorded against this rescue case.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <h3 className="text-xl font-bold text-foreground">ENTER YOUR DONATION AMOUNT</h3>
        <div className="mt-4 space-y-5">
          <div>
            <Label htmlFor="amount" className="text-base">
              Donation amount (INR)
            </Label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                ₹
              </span>
              <Input
                id="amount"
                inputMode="decimal"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 pl-8 text-base"
                aria-invalid={Boolean(errors.amount)}
              />
            </div>
            {errors.amount && <FieldError>{errors.amount}</FieldError>}
          </div>

          <div>
            <Label htmlFor="donorName" className="text-base">
              Donor name
            </Label>
            <Input
              id="donorName"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="mt-2 h-12 text-base"
              autoComplete="name"
              aria-invalid={Boolean(errors.donorName)}
            />
            {errors.donorName && <FieldError>{errors.donorName}</FieldError>}
          </div>

          <div>
            <Label htmlFor="mobile" className="text-base">
              Mobile number
            </Label>
            <Input
              id="mobile"
              inputMode="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="mt-2 h-12 text-base"
              autoComplete="tel"
              aria-invalid={Boolean(errors.mobileNumber)}
            />
            {errors.mobileNumber && <FieldError>{errors.mobileNumber}</FieldError>}
            <p className="mt-1 text-xs text-muted-foreground">
              Kept private. Used only to confirm your donation.
            </p>
          </div>

          <div>
            <Label htmlFor="reference" className="text-base">
              Payment reference / UTR
            </Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-2 h-12 text-base"
              aria-invalid={Boolean(errors.reference)}
            />
            {errors.reference && <FieldError>{errors.reference}</FieldError>}
          </div>

          <div>
            <Label htmlFor="screenshot" className="text-base">
              Upload payment screenshot
            </Label>
            <input
              ref={fileInput}
              id="screenshot"
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-12 w-full justify-start text-base"
              onClick={() => fileInput.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {file ? file.name : "Choose file (JPG, PNG, WEBP or PDF)"}
            </Button>
            {errors.file && <FieldError>{errors.file}</FieldError>}
          </div>

          {submitting && (
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Uploading… {progress}%</p>
            </div>
          )}

          {formError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {formError}
            </p>
          )}

          <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit donation details
          </Button>
          <p className="text-xs text-muted-foreground">
            Submissions are recorded as pending until an administrator verifies the payment.
          </p>
        </div>
      </form>
    </section>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm font-medium text-destructive">{children}</p>;
}
