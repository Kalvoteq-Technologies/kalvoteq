import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Brain,
  Cloud,
  Code2,
  Quote,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import heroImage from "@/assets/hero-network.jpg";
import { CTASection, Section, Stat } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  caseStudies,
  differentiators,
  industries,
  processSteps,
  services,
  testimonials,
} from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "kalvoteq — Software Consulting & Engineering Teams in Europe" },
      {
        name: "description",
        content:
          "We build, modernize, and scale digital products with senior engineering teams. Custom software, cloud, AI, and dedicated squads from Tallinn, Estonia.",
      },
      { property: "og:title", content: "kalvoteq — Software Consulting & Engineering Teams" },
      {
        property: "og:description",
        content: "High-performance software solutions and engineering teams for enterprises, scale-ups, and the public sector.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const serviceIcons = [Code2, Boxes, Cloud, Brain, Smartphone, Users];

function TrustedBy() {
  const logos = ["NORDBANK", "MEDICO", "VELOCITA", "GRIDWORKS", "ATLAS RETAIL", "CIVICA"];
  return (
    <div className="border-y border-border bg-surface py-10">
      <div className="container-page">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Trusted by teams in finance, health, logistics and the public sector
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex h-12 items-center justify-center rounded-md border border-dashed border-border font-display text-sm font-bold tracking-[0.14em] text-muted-foreground"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <img
        src={heroImage}
        alt=""
        width={1600}
        height={1200}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.07]" aria-hidden="true" />
      <div className="container-page relative grid gap-16 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:py-32">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Tallinn, Estonia — delivering globally
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.03] sm:text-5xl lg:text-[3.75rem]">
            Building high-performance software solutions and engineering teams.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            kalvoteq designs, builds, and modernises the systems organisations depend on — from
            enterprise platforms and cloud infrastructure to applied AI — with senior European
            engineers who own the outcome.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/contact">
                Book consultation <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
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

        <div className="grid grid-cols-2 gap-px self-center overflow-hidden rounded-xl border border-white/10 bg-white/10">
          {[
            { value: "120+", label: "Products delivered" },
            { value: "9 yrs", label: "Median engineer experience" },
            { value: "4", label: "Continents served" },
            { value: "96%", label: "Client retention" },
          ].map((s) => (
            <div key={s.label} className="bg-ink/70 p-6 backdrop-blur-sm">
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 7000);
    return () => clearInterval(id);
  }, []);
  const active = testimonials[index]!;

  return (
    <Section eyebrow="Clients" title="What partners say" muted>
      <figure className="max-w-3xl">
        <Quote className="h-8 w-8 text-primary" aria-hidden="true" />
        <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug sm:text-3xl">
          "{active.quote}"
        </blockquote>
        <figcaption className="mt-6 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{active.author}</span> — {active.role}
        </figcaption>
      </figure>
      <div className="mt-8 flex gap-2" role="tablist" aria-label="Testimonials">
        {testimonials.map((t, i) => (
          <button
            key={t.author}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Testimonial from ${t.author}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 w-10 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>
    </Section>
  );
}

function HomePage() {
  const featured = services.filter((s) => s.featured).slice(0, 6);

  return (
    <>
      <Hero />
      <TrustedBy />

      <Section
        eyebrow="Services"
        title="Engineering capability, end to end"
        intro="Six core practices, delivered by senior specialists who have shipped the same problem before."
      >
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {featured.map((service, i) => {
            const Icon = serviceIcons[i % serviceIcons.length]!;
            return (
              <Link
                key={service.slug}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group bg-card p-8 transition-colors hover:bg-surface"
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Explore
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/services">All services</Link>
          </Button>
        </div>
      </Section>

      <Section eyebrow="Why kalvoteq" title="Consulting without the consulting overhead" muted>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-card p-7 card-hover">
              <Shield className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Industries" title="Domain knowledge that shortens delivery">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              to="/industries/$slug"
              params={{ slug: industry.slug }}
              className="group rounded-lg border border-border bg-card p-6 card-hover"
            >
              <h3 className="font-semibold">{industry.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{industry.blurb}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Process" title="A delivery model you can plan around" muted>
        <ol className="relative grid gap-8 border-l border-border pl-8 lg:grid-cols-2">
          {processSteps.map((step) => (
            <li key={step.step} className="relative">
              <span className="absolute -left-[2.3rem] grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-[0.65rem] font-semibold text-primary">
                {step.step}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Case studies" title="Selected work" intro="Named clients available under NDA on request.">
        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              to="/case-studies/$slug"
              params={{ slug: cs.slug }}
              className="flex flex-col rounded-xl border border-border bg-card p-7 card-hover"
            >
              <Badge variant="secondary" className="w-fit">
                {cs.sector}
              </Badge>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{cs.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{cs.problem}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
                {cs.results.map((r) => (
                  <div key={r.label}>
                    <p className="font-display text-base font-bold">{r.value}</p>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {cs.technologies.slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Testimonials />

      <Section title="" className="border-t border-border">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="10–15 days" label="Typical team mobilisation" />
          <Stat value="EU" label="Data residency by default" />
          <Stat value="24/7" label="Operations coverage available" />
          <Stat value="100%" label="IP transferred to the client" />
        </div>
      </Section>

      <CTASection />
    </>
  );
}
