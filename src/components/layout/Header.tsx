import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

import logoSrc from "@/assets/kalvoteq-logo.png";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { Button } from "@/components/ui/button";
import { services, industries } from "@/data/site";
import { cn } from "@/lib/utils";

const primaryNav = [
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "Insights", to: "/insights" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
] as const;

const teamsNav = [
  { label: "Dedicated Developers", hash: "engagement-models" },
  { label: "Team Augmentation", hash: undefined },
  { label: "Dedicated Engineering Squads", hash: "dedicated-squad" },
  { label: "Technical Specialists", hash: "engineer-categories" },
  { label: "Time & Materials", hash: "time-and-materials" },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const engineering = services.filter((s) => s.category === "engineering").slice(0, 5);
  const transformation = services.filter((s) => s.category === "transformation").slice(0, 5);

  return (
    <div className="container-page grid gap-10 py-8 lg:grid-cols-4">
      <div>
        <p className="eyebrow">Engineering</p>
        <ul className="mt-4 space-y-2">
          {engineering.map((s) => (
            <li key={s.slug}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                onClick={onNavigate}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Transformation</p>
        <ul className="mt-4 space-y-2">
          {transformation.map((s) => (
            <li key={s.slug}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                onClick={onNavigate}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Teams</p>
        <ul className="mt-4 space-y-2">
          {teamsNav.map((t) => (
            <li key={t.label}>
              <Link
                to="/services/team-augmentation"
                hash={t.hash}
                onClick={onNavigate}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Industries</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {industries.map((i) => (
            <li key={i.slug}>
              <Link
                to="/industries/$slug"
                params={{ slug: i.slug }}
                onClick={onNavigate}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {i.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Header() {
  const { dark, toggle } = useTheme();
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobile(false)}>
          <img
            src={logoSrc}
            alt="kalvoteq"
            className="h-11 w-auto md:h-14"
            width={1535}
            height={1024}
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <button
            type="button"
            onClick={() => setMega((v) => !v)}
            aria-expanded={mega}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              mega && "text-foreground",
            )}
          >
            Explore
          </button>
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMega(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={toggle}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <AccountMenu />
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/contact">Talk to an Expert</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobile ? "Close menu" : "Open menu"}
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mega && (
        <div className="hidden border-t border-border bg-background lg:block">
          <MegaMenu onNavigate={() => setMega(false)} />
        </div>
      )}

      {mobile && (
        <div className="max-h-[70vh] overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-4" aria-label="Mobile">
            {primaryNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobile(false)}
                className="border-b border-border/60 py-3 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobile(false)}
              className="py-3 text-sm font-medium text-primary"
            >
              Talk to an Expert
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
