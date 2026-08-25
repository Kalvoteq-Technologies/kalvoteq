import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { services } from "@/data/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Engineering & Technology Consulting Services — kalvoteq" },
      {
        name: "description",
        content:
          "Custom software, enterprise platforms, cloud and DevOps, AI, mobile, and technology consulting — delivered by senior European engineers, or scaled with dedicated teams.",
      },
      { property: "og:title", content: "Engineering & Technology Consulting Services — kalvoteq" },
      {
        property: "og:description",
        content:
          "Engineering practices delivered by senior specialists who have shipped the same problem before.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesIndex,
});

function ServiceGrid({ items }: { items: typeof services }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
      {items.map((service) => (
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
  );
}

function ServicesIndex() {
  const engineering = services.filter((s) => s.category === "engineering");
  const transformation = services.filter((s) => s.category === "transformation");

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Engineering practices built for production, not pitch decks"
        intro="Each practice is staffed by specialists with delivery history in the same problem space. Engage one, or combine them into a full delivery squad. Need engineering capacity instead of a project? See Scale Your Team."
      />

      <Section eyebrow="Engineering" title="Building your technology">
        <ServiceGrid items={engineering} />
      </Section>

      <Section eyebrow="Transformation" title="Modernising and evolving your technology" muted>
        <ServiceGrid items={transformation} />
      </Section>

      <Section eyebrow="Teams" title="Scaling your engineering capacity">
        <div className="rounded-xl border border-border bg-card p-8">
          <h3 className="text-lg font-semibold">Team Augmentation</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Dedicated developers, dedicated engineering squads, technical specialists, and flexible
            time-and-materials engagements — experienced engineers who integrate with your existing
            organization and workflows.
          </p>
          <Button asChild className="mt-6">
            <Link to="/services/team-augmentation">Build Your Engineering Team</Link>
          </Button>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
