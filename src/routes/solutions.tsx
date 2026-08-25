import { createFileRoute, Link } from "@tanstack/react-router";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { solutions } from "@/data/site";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions by Business Problem — kalvoteq" },
      {
        name: "description",
        content:
          "MVP builds, legacy modernization, cloud migration, AI automation, digital transformation, and dedicated teams — organised by the problem you need solved.",
      },
      { property: "og:title", content: "Solutions by Business Problem — kalvoteq" },
      { property: "og:description", content: "Eight engagement shapes with indicative timelines and approach." },
      { property: "og:url", content: "/solutions" },
    ],
    links: [{ rel: "canonical", href: "/solutions" }],
  }),
  component: SolutionsPage,
});

function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Start from the problem, not the technology"
        intro="Eight engagement shapes we run repeatedly, each with a defined approach, timeline, and exit criteria."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((s) => (
            <article key={s.slug} id={s.slug} className="scroll-mt-24 rounded-xl border border-border bg-card p-8 card-hover">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <Badge variant="secondary" className="shrink-0">
                  {s.timeline}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.problem}</p>
              <ol className="mt-5 space-y-2 text-sm">
                {s.approach.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-display text-xs font-bold text-primary">{`0${i + 1}`}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link to="/contact">Discuss this</Link>
              </Button>
            </article>
          ))}
        </div>
      </Section>
      <CTASection />
    </>
  );
}
