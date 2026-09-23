import { Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareCase({ animalName, slug }: { animalName: string; slug: string }) {
  const [url, setUrl] = useState("");
  const shareUrl =
    url || (typeof window !== "undefined" ? `${window.location.origin}/rescue/${slug}` : "");
  const message = `Help ${animalName} — VEGANFARM Animal Rescue: ${shareUrl}`;

  function ensureUrl() {
    if (!url && typeof window !== "undefined") setUrl(window.location.href);
  }

  async function nativeShare() {
    ensureUrl();
    const link = shareUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Help ${animalName} — VEGANFARM`, text: message, url: link });
      } catch {
        /* dismissed by the user */
      }
      return;
    }
    await copyLink();
  }

  async function copyLink() {
    const link = shareUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <p className="eyebrow">Share this case</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Sharing helps this animal reach more people who can contribute.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="default" className="min-h-11">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </Button>
        <Button variant="outline" className="min-h-11" onClick={copyLink}>
          <Copy className="mr-2 h-4 w-4" /> Copy link
        </Button>
        <Button variant="outline" className="min-h-11" onClick={nativeShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>
    </div>
  );
}
