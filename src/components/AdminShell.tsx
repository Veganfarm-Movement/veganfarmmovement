import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin, getMyAdminStatus } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { LOGO_URL } from "@/lib/brand";

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/cases", label: "Cases" },
  { to: "/admin/donations", label: "Donations" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const statusFn = useServerFn(getMyAdminStatus);
  const claimFn = useServerFn(claimFirstAdmin);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn() });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  let body: ReactNode = children;
  if (status.isLoading) body = <p className="text-sm text-muted-foreground">Loading…</p>;
  else if (!status.data?.isAdmin)
    body = (
      <div className="max-w-md rounded-xl border border-border bg-card p-6 shadow-card">
        <h1 className="text-lg font-bold">No administrator access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account is not an administrator. If no administrator has been set up yet, you can claim
          the role now.
        </p>
        <Button
          className="mt-4"
          onClick={async () => {
            const r = await claimFn();
            if (r.granted) status.refetch();
            else setClaimMsg("An administrator already exists. Ask them for access.");
          }}
        >
          Set up as administrator
        </Button>
        {claimMsg && <p className="mt-3 text-sm text-destructive">{claimMsg}</p>}
      </div>
    );

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-card">
        <div className="container-page flex flex-wrap items-center gap-3 py-3">
          <Link to="/"><img src={LOGO_URL} alt="VEGANFARM" className="h-10 w-auto" /></Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/admin" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <main className="container-page py-8">{body}</main>
    </div>
  );
}
