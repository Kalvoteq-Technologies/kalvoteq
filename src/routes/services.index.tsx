import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { services } from "@/data/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Software Consulting Services — kalvoteq" },
      {
        name: "description",
        content:
          "Custom software, enterprise platforms, cloud and DevOps, AI, mobile, cybersecurity, design, QA, and dedicated engineering teams.",
      },
      { property: "og:title", content: "Software Consulting Services — kalvoteq" },
      { property: "og:description", content: "Eleven engineering practices delivered by senior European specialists." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Engineering practices built for production, not pitch decks"
        intro="Each practice is staffed by specialists with delivery history in the same problem space. Engage one, or combine them into a full delivery squad."
      />
      <Section>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.slug}
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="group bg-card p-8 transition-colors hover:bg-surface"
            >
              <h2 className="text-lg font-semibold">{service.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                View service
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
      <CTASection />
    </>
  );
}
