import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHero } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmailToSelf } from "@/lib/welcome.functions";



const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — kalvoteq Editorial" },
      { name: "description", content: "Sign in to the kalvoteq editorial workspace to draft, edit, and publish insights articles." },
      { property: "og:title", content: "Sign in — kalvoteq Editorial" },
      { property: "og:description", content: "Access the kalvoteq insights editor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const target = redirect && redirect.startsWith("/") ? redirect : "/admin";

  useEffect(() => {
    if (!loading && user) navigate({ to: target });
  }, [loading, user, navigate, target]);

  async function submit(mode: "signin" | "signup", form: HTMLFormElement) {
    const data = new FormData(form);
    const parsed = credentials.safeParse({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setBusy(true);


    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        toast.success("Signed in");
      } else {
        const { data: result, error } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
        if (!result.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Account created");
        try {
          await sendWelcomeEmailToSelf({ data: undefined });
        } catch {
          // Welcome email is best-effort.
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword(email: string) {
    const parsed = z.string().trim().email().max(255).safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your work email above first, then tap reset.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent — check your inbox.");
  }

  async function google() {

    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${target}` },
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
  }

  return (
    <>
      <PageHero eyebrow="Editorial" title="Sign in to the editor" intro="Draft, review, and publish kalvoteq insights articles." />
      <section className="section-y">
        <div className="container-page max-w-md">
          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create account
              </TabsTrigger>
            </TabsList>

            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode}>
                <form
                  className="mt-6 space-y-4 rounded-xl border border-border bg-card p-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit(mode, e.currentTarget);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`${mode}-email`}>Work email</Label>
                    <Input id={`${mode}-email`} name="email" type="email" autoComplete="email" maxLength={255} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${mode}-password`}>Password</Label>
                    <Input
                      id={`${mode}-password`}
                      name="password"
                      type="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      minLength={8}
                      maxLength={72}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {mode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      disabled={busy}
                      onClick={(e) => {
                        const form = e.currentTarget.closest("form");
                        const email = form ? String(new FormData(form).get("email") ?? "") : "";
                        void forgotPassword(email);
                      }}
                    >
                      Forgot your password?
                    </button>
                  )}
                </form>

              </TabsContent>
            ))}
          </Tabs>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" disabled={busy} onClick={() => void google()}>
            Continue with Google
          </Button>
        </div>
      </section>
    </>
  );
}
