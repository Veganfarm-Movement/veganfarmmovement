import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { BRAND, LOGO_URL } from "@/lib/brand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/rescue", label: "Rescue Cases" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/transparency", label: "Transparency" },
  { to: "/about", label: "About VEGANFARM" },
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page flex flex-col items-center gap-3 py-3 md:py-4">
          <div className="flex w-full items-center justify-between md:justify-center">
            <Link to="/" className="flex items-center gap-2" aria-label={`${BRAND.name} home`}>
              <img
                src={LOGO_URL}
                alt="VEGANFARM logo"
                width={160}
                height={160}
                className="h-11 w-auto md:h-14"
              />
            </Link>
            <div className="md:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[82vw] max-w-xs">
                  <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
                  <nav className="mt-6 flex flex-col gap-1">
                    {NAV.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                        activeProps={{ className: "bg-accent text-accent-foreground" }}
                        activeOptions={{ exact: item.to === "/" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-surface">
        <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <img src={LOGO_URL} alt="VEGANFARM logo" width={140} height={140} className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground">
              {BRAND.name} — {BRAND.status}. Donations collected through this platform are intended
              for the specific animal shown on the relevant campaign page.
            </p>
            <p className="text-sm font-semibold text-foreground">{BRAND.tagline}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">
              Administrator sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
