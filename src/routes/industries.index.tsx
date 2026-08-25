import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { industries } from "@/data/site";

export const Route = createFileRoute("/industries/")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — kalvoteq" },
      {
        name: "description",
        content:
          "FinTech, healthcare, logistics, retail, manufacturing, education, public sector, and energy — software engineering with domain context.",
      },
      { property: "og:title", content: "Industries We Serve — kalvoteq" },
      {
        property: "og:description",
        content: "Regulated, high-volume, and mission-critical environments across eight sectors.",
      },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: IndustriesIndex,
});

function IndustriesIndex() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Sector context, not generic delivery"
        intro="Regulation, data models, and operational realities differ by sector. Our teams arrive with that context already in place."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              to="/industries/$slug"
              params={{ slug: industry.slug }}
              className="group rounded-xl border border-border bg-card p-8 card-hover"
            >
              <h2 className="text-xl font-semibold">{industry.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{industry.blurb}</p>
              <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                {industry.capabilities.slice(0, 2).map((c) => (
                  <li key={c}>— {c}</li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Read more
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
