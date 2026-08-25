import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { processSteps, services, type Service } from "@/data/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Service not found — kalvoteq" }, { name: "robots", content: "noindex" }] };
    }
    const { service } = loaderData;
    return {
      meta: [
        { title: `${service.title} — kalvoteq` },
        { name: "description", content: service.summary },
        { property: "og:title", content: `${service.title} — kalvoteq` },
        { property: "og:description", content: service.summary },
        { property: "og:url", content: `/services/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/services/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.summary,
            provider: { "@type": "Organization", name: "kalvoteq" },
          }),
        },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData() as { service: Service };

  return (
    <>
      <PageHero eyebrow="Service" title={service.title} intro={service.overview}>
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/services" className="hover:text-foreground">
            Services
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{service.title}</span>
        </nav>
      </PageHero>

      <Section eyebrow="Benefits" title="What you get">
        <ul className="grid gap-5 md:grid-cols-2">
          {service.benefits.map((b) => (
            <li key={b} className="flex gap-3 rounded-lg border border-border bg-card p-6">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <span className="text-sm leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Technology" title="Stack we work in" muted>
        <div className="flex flex-wrap gap-2">
          {service.stack.map((t) => (
            <Badge key={t} variant="outline" className="bg-background px-3 py-1.5 text-sm font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </Section>

      <Section eyebrow="Process" title="How the engagement runs">
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.slice(0, 4).map((s) => (
            <li key={s.step} className="rounded-lg border border-border bg-card p-6">
              <span className="text-xs font-semibold text-primary">{s.step}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="FAQ" title="Common questions" muted>
        <Accordion type="single" collapsible className="max-w-3xl">
          {service.faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link to="/services">All services</Link>
          </Button>
        </div>
      </Section>

      <CTASection title={`Ready to start with ${service.title.toLowerCase()}?`} />
    </>
  );
}
