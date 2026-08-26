import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import logoSrc from "@/assets/kalvoteq-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bankDetails, company, services, industries } from "@/data/site";

const columns = [
  {
    title: "Services",
    links: services
      .slice(0, 6)
      .map((s) => ({ label: s.title, to: "/services/$slug", params: { slug: s.slug } })),
  },
  {
    title: "Industries",
    links: industries
      .slice(0, 6)
      .map((i) => ({ label: i.name, to: "/industries/$slug", params: { slug: i.slug } })),
  },
] as const;

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "Insights", to: "/insights" },
  { label: "Careers", to: "/careers" },
  { label: "Start a Project", to: "/start-a-project" },
  { label: "Scale Your Team", to: "/scale-your-team" },
  { label: "Contact Kalvoteq", to: "/contact" },
] as const;

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Cookie Policy", to: "/cookies" },
  { label: "Terms of Service", to: "/terms" },
] as const;

const companyDetails = [
  { label: "Registry code", value: company.registryCode },
  { label: "VAT", value: company.vatNumber },
  { label: "IBAN", value: bankDetails.iban },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-ink text-ink-foreground">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="kalvoteq"
              className="h-24 w-auto"
              width={1535}
              height={1024}
            />
          </div>
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            {company.tagline} Estonian headquarters, global delivery.
          </p>
          <form
            className="mt-6 flex max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                toast.error("Please enter a valid email address.");
                return;
              }
              setEmail("");
              toast.success("Subscribed. Look out for the next Insights issue.");
            }}
          >
            <Input
              type="email"
              required
              maxLength={255}
              aria-label="Email address for newsletter"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-white/5 text-ink-foreground placeholder:text-ink-muted"
            />
            <Button type="submit" size="icon" aria-label="Subscribe to newsletter">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    params={l.params}
                    className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Company
          </p>
          <ul className="mt-4 space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Company Details
          </p>
          <ul className="mt-4 space-y-2.5">
            {companyDetails.map((d) => (
              <li key={d.label} className="text-sm text-ink-muted">
                <span className="block text-xs text-ink-muted/70">{d.label}</span>
                {d.value}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}. {company.address}
          </p>
          <ul className="flex flex-wrap gap-5">
            {legalLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-ink-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
