import { createFileRoute, Link } from "@tanstack/react-router";

import { PublicShell } from "@/components/PublicShell";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "See the animal", body: "Open a rescue case to see the animal and its photographs." },
  { title: "Understand the case", body: "Read the case details entered by the administrator." },
  { title: "See the funding requirement", body: "Each case shows the exact amount required, raised and remaining." },
  { title: "Scan the VEGANFARM QR code", body: "Use the QR code on the case page with any supported UPI app." },
  {
    title: "Donate any amount",
    body: "Choose what you can contribute. Donors seeking 80G/12A documentation should note the ₹25,000 minimum and that VEGANFARM currently does not issue 80G receipts or offer tax-deductible donations.",
  },
  { title: "Submit your payment details", body: "Enter your amount, name, mobile number, payment reference and upload your screenshot." },
  { title: "Receive your donation reference", body: "You get a unique reference ID such as VF-DON-2026-000001 to keep." },
  { title: "Verification", body: "Your donation stays pending until an administrator verifies the payment." },
  { title: "Case total updates", body: "After verification, the amount is automatically added to the case total." },
] as const;

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — VEGANFARM Animal Rescue" },
      {
        name: "description",
        content:
          "How donating through VEGANFARM works: scan the QR code, pay, submit your payment reference and screenshot, and an administrator verifies the donation.",
      },
      { property: "og:title", content: "How It Works — VEGANFARM Animal Rescue" },
      {
        property: "og:description",
        content: "The nine steps from seeing an animal to a verified donation.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <PublicShell>
      <div className="container-page py-10 md:py-14">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground md:text-4xl">
          From payment to a verified donation
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          QR payments are not verified automatically. Every submission is checked by an administrator
          before it counts towards a case total.
        </p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <span className="eyebrow">Step {index + 1}</span>
              <h2 className="mt-2 text-lg font-bold text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-xl border border-border bg-primary-soft p-6">
          <h2 className="text-lg font-bold text-foreground">A note on verification</h2>
          <p className="mt-2 text-sm text-foreground">
            A submitted screenshot alone does not verify a donation. Pending and rejected submissions
            never increase the public fundraising total.
          </p>
          <Button asChild className="mt-4 h-12 text-base font-semibold">
            <Link to="/rescue">VIEW RESCUE CASES</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
