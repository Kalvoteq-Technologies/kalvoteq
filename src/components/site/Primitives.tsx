import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
      <div className="container-page relative py-20 lg:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className,
  muted,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={cn("section-y", muted && "bg-surface", className)}>
      <div className="container-page">
        {(eyebrow || title) && (
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>}
            {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
          </div>
        )}
        <div className={cn((eyebrow || title) && "mt-12")}>{children}</div>
      </div>
    </section>
  );
}

export function CTASection({
  title = "Let's build your next digital product",
  text = "Tell us what you are trying to ship. We will come back within one business day with a route to get there.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="section-y bg-ink text-ink-foreground">
      <div className="container-page flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg text-ink-muted">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contact">Book consultation</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
          >
            <Link to="/services/$slug" params={{ slug: "dedicated-teams" }}>
              Hire developers
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-border pl-5">
      <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
