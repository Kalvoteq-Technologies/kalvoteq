import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Brain, Cloud, Code2, Smartphone, Users } from "lucide-react";

import heroImage from "@/assets/hero-network.jpg";
import { BuildScaleCards } from "@/components/site/BuildScaleCards";
import { EngagementModels } from "@/components/site/EngagementModels";
import { CTASection, Section } from "@/components/site/Primitives";
import { TechInsightsTicker } from "@/components/site/TechInsightsTicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  caseStudies,
  caseStudyTypeLabel,
  differentiators,
  howWeWork,
  industries,
  processSteps,
  services,
  technologyExpertise,
} from "@/data/site";
import { tickerItems } from "@/data/ticker";
import { imageSrc, publishedPostsQuery } from "@/lib/blog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "kalvoteq — Software Engineering & Engineering Teams in Europe" },
      {
        name: "description",
        content:
          "Kalvoteq builds software, modernises systems and helps organisations scale engineering capability — with senior European engineers, dedicated teams, and delivery you can plan around.",
      },
      { property: "og:title", content: "kalvoteq — Software Engineering & Engineering Teams" },
      {
        property: "og:description",
        content:
          "Engineering first. Talent when you need it. Build technology, or scale your engineering team.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const serviceIcons = [Code2, Boxes, Cloud, Brain, Smartphone, Users];

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
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-[0.07]"
        aria-hidden="true"
      />
      <div className="container-page relative py-24 lg:py-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            European company — global engineering capability
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-5xl lg:text-[3.75rem]">
            Building High-Performance Software Solutions and Engineering Teams
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            kalvoteq helps startups, growing companies and enterprises build software, modernise
            systems, adopt AI, scale cloud infrastructure, and access experienced engineering
            talent.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/start-a-project">
                Start a Project <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
            >
              <Link to="/scale-your-team">Scale Your Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuiltForAmbitiousTeams() {
  return (
    <div className="border-y border-border bg-surface py-14">
      <div className="container-page mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Built to Support Ambitious Technology Teams
        </h2>
        <p className="mt-3 text-muted-foreground">
          From early-stage products to complex enterprise environments, Kalvoteq provides
          engineering capabilities designed to scale with our clients.
        </p>
      </div>
    </div>
  );
}

function InsightsTeaser() {
  const { data: posts = [] } = useQuery(publishedPostsQuery());
  const latest = posts.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <Section
      eyebrow="Insights"
      title="Field notes from delivery"
      intro="Written by the engineers and consultants doing the work."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {latest.map((post) => (
          <Link
            key={post.id}
            to="/insights/$slug"
            params={{ slug: post.slug }}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover"
          >
            {post.cover_image_url && (
              <img
                src={imageSrc(post.cover_image_url)}
                alt={post.title}
                loading="lazy"
                className="aspect-video w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col p-6">
              {post.categories && (
                <Badge variant="secondary" className="w-fit">
                  {post.categories.name}
                </Badge>
              )}
              <h3 className="mt-4 text-lg font-semibold leading-snug">{post.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link to="/insights">All insights</Link>
        </Button>
      </div>
    </Section>
  );
}

function HomePage() {
  const featured = services.filter((s) => s.featured).slice(0, 6);

  return (
    <>
      <TechInsightsTicker items={tickerItems} />
      <Hero />
      <BuiltForAmbitiousTeams />

      <Section
        eyebrow="How We Work With You"
        title="Two Ways to Work With Kalvoteq"
        intro="Whether you need us to deliver the technology or strengthen the team already building it, Kalvoteq provides flexible engineering engagement models aligned with your objectives."
      >
        <BuildScaleCards />
      </Section>

      <Section
        eyebrow="Services"
        title="Engineering capability, end to end"
        intro="Core practices, delivered by senior specialists who have shipped the same problem before."
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
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.summary}
                </p>
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

      <Section eyebrow="Why Kalvoteq" title="Engineering Partnerships Built for Growth" muted>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-card p-7 card-hover"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="How We Work" title="Principles that guide every engagement">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {howWeWork.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-card p-7 card-hover"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Industries" title="Domain knowledge that shortens delivery" muted>
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

      <Section eyebrow="Process" title="How We Deliver">
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

      <EngagementModels />

      <Section eyebrow="Technology Expertise" title="Technology we work in every day" muted>
        <div className="flex flex-wrap gap-3">
          {technologyExpertise.map((t) => (
            <Badge key={t} variant="outline" className="px-4 py-2 text-sm font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Case studies"
        title="Verified Case Studies"
        intro="Named clients available under NDA on request."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              to="/case-studies/$slug"
              params={{ slug: cs.slug }}
              className="flex flex-col rounded-xl border border-border bg-card p-7 card-hover"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{cs.sector}</Badge>
                <Badge variant="outline" className="font-normal">
                  {caseStudyTypeLabel[cs.type]}
                </Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{cs.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {cs.problem}
              </p>
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

      <InsightsTeaser />

      <CTASection />
    </>
  );
}
