import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO_URL } from "@/lib/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Administrator sign in — VEGANFARM" },
      { name: "description", content: "Sign in to the VEGANFARM administrator dashboard." },
      { property: "og:title", content: "Administrator sign in — VEGANFARM" },
      { property: "og:description", content: "VEGANFARM administrator access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    if (!res.data.session) {
      setError("Please check your email to confirm your account, then sign in.");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-card"
      >
        <img src={LOGO_URL} alt="VEGANFARM logo" className="mx-auto h-16 w-auto" />
        <h1 className="mt-4 text-center text-xl font-bold text-foreground">
          {mode === "signin" ? "Administrator sign in" : "Create administrator account"}
        </h1>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-11" />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "First time? Create the administrator account" : "Already have an account? Sign in"}
          </button>
          <p className="text-xs text-muted-foreground">
            Only the first account created becomes the administrator. Other accounts have no access.
          </p>
        </div>
      </form>
    </div>
  );
}
