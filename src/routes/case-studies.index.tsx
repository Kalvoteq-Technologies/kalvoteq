import { createFileRoute, Link } from "@tanstack/react-router";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { caseStudies } from "@/data/site";

export const Route = createFileRoute("/case-studies/")({
  head: () => ({
    meta: [
      { title: "Case Studies — kalvoteq Software Consulting" },
      {
        name: "description",
        content: "Real delivery outcomes in payments, healthcare, and logistics — problem, solution, technology, and measured business results.",
      },
      { property: "og:title", content: "Case Studies — kalvoteq" },
      { property: "og:description", content: "Selected engagements with measured business outcomes." },
      { property: "og:url", content: "/case-studies" },
    ],
    links: [{ rel: "canonical", href: "/case-studies" }],
  }),
  component: CaseStudiesIndex,
});

function CaseStudiesIndex() {
  return (
    <>
      <PageHero
        eyebrow="Case studies"
        title="Work measured in business outcomes"
        intro="A selection of engagements we are able to describe publicly. Named references are available under NDA."
      />
      <Section>
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
              <h2 className="mt-4 text-lg font-semibold leading-snug">{cs.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{cs.problem}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-5">
                {cs.results.map((r) => (
                  <div key={r.label}>
                    <p className="font-display text-base font-bold">{r.value}</p>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <CTASection />
    </>
  );
}
