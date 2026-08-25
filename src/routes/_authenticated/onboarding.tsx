import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { myProfileQuery } from "@/lib/avatars";
import {
  ONBOARDING_TRACKS,
  onboardingStorageKey,
  readCompleted,
  writeCompleted,
} from "@/lib/onboarding";
import { ROLE_LABELS } from "@/lib/roles";
import { resolveWelcomeRole } from "@/lib/welcome.shared";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Getting started — kalvoteq" },
      {
        name: "description",
        content:
          "Your personalised kalvoteq onboarding checklist with the next steps for your role.",
      },
      { property: "og:title", content: "Getting started — kalvoteq" },
      { property: "og:description", content: "Complete your kalvoteq setup step by step." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { user, roles, rolesLoading } = useAuth();
  const { data: profile } = useQuery(myProfileQuery(user?.id));

  const role = resolveWelcomeRole(roles);
  const track = ONBOARDING_TRACKS[role];
  const storageKey = user ? onboardingStorageKey(user.id, role) : "";

  const [manual, setManual] = useState<string[]>([]);

  useEffect(() => {
    if (storageKey) setManual(readCompleted(storageKey));
  }, [storageKey]);

  const isDone = useMemo(
    () => (id: string, auto?: "display_name" | "avatar") => {
      if (auto === "display_name") return Boolean(profile?.display_name?.trim());
      if (auto === "avatar") return Boolean(profile?.avatar_url);
      return manual.includes(id);
    },
    [manual, profile],
  );

  function toggle(id: string) {
    const next = manual.includes(id) ? manual.filter((x) => x !== id) : [...manual, id];
    setManual(next);
    if (storageKey) writeCompleted(storageKey, next);
  }

  const done = track.steps.filter((s) => isDone(s.id, s.auto)).length;
  const percent = Math.round((done / track.steps.length) * 100);

  return (
    <>
      <PageHero eyebrow="Getting started" title={track.headline} intro={track.intro} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {rolesLoading
                  ? "Checking your access…"
                  : roles.length
                    ? `Access: ${roles.map((r) => ROLE_LABELS[r]).join(" · ")}`
                    : "No access granted yet — an administrator will assign your role."}
              </div>
              <Badge variant={percent === 100 ? "default" : "secondary"}>
                {done} of {track.steps.length} complete
              </Badge>
            </div>
            <Progress value={percent} className="mt-4" />
          </div>

          <ol className="space-y-4">
            {track.steps.map((step, index) => {
              const complete = isDone(step.id, step.auto);
              return (
                <li
                  key={step.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start"
                >
                  <div className="pt-0.5">
                    <Checkbox
                      checked={complete}
                      disabled={Boolean(step.auto)}
                      onCheckedChange={() => toggle(step.id)}
                      aria-label={`Mark "${step.title}" complete`}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <h2
                      className={`text-base font-semibold ${complete ? "text-muted-foreground line-through" : ""}`}
                    >
                      {step.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.auto && !complete && (
                      <p className="text-xs text-muted-foreground">
                        This step completes automatically once saved.
                      </p>
                    )}
                  </div>
                  <Button asChild variant={complete ? "ghost" : "outline"} size="sm">
                    <Link to={step.to}>{step.ctaLabel}</Link>
                  </Button>
                </li>
              );
            })}
          </ol>

          {percent === 100 && (
            <p className="text-center text-sm text-muted-foreground">
              You are all set. Anything unclear?{" "}
              <Link to="/contact" className="underline underline-offset-4">
                Talk to us
              </Link>
              .
            </p>
          )}
        </div>
      </Section>
    </>
  );
}
