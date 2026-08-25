import { createFileRoute, Link } from "@tanstack/react-router";

import { EngagementModels } from "@/components/site/EngagementModels";
import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { engineerCategories, talentProcessSteps } from "@/data/site";

export const Route = createFileRoute("/services/team-augmentation")({
  head: () => ({
    meta: [
      { title: "Scale Your Engineering Team — kalvoteq" },
      {
        name: "description",
        content:
          "Access experienced software engineers and technology specialists who integrate with your existing organization, workflows and engineering culture.",
      },
      { property: "og:title", content: "Scale Your Engineering Team — kalvoteq" },
      {
        property: "og:description",
        content: "Dedicated developers, dedicated squads, and flexible engagement models.",
      },
      { property: "og:url", content: "/services/team-augmentation" },
    ],
    links: [{ rel: "canonical", href: "/services/team-augmentation" }],
  }),
  component: TeamAugmentationPage,
});

function TeamAugmentationPage() {
  return (
    <>
      <PageHero
        eyebrow="Scale Your Team"
        title="Scale Your Engineering Team"
        intro="Access experienced software engineers and technology specialists who integrate with your existing organization, workflows and engineering culture."
      >
        <Button asChild size="lg">
          <Link to="/scale-your-team">Request Engineering Talent</Link>
        </Button>
      </PageHero>

      <Section
        id="engineer-categories"
        eyebrow="Engineers"
        title="Engineering talent across every discipline"
        intro="Every engineer is matched to your technology stack and seniority requirements."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {engineerCategories.map((cat) => (
            <div key={cat.slug} className="card-hover rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">{cat.title}</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {cat.stack.map((s) => (
                  <Badge key={s} variant="outline" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="How It Works" title="From request to onboarding" muted>
        <ol className="relative grid gap-8 border-l border-border pl-8 lg:grid-cols-2">
          {talentProcessSteps.map((step) => (
            <li key={step.step} className="relative">
              <span className="absolute -left-[2.3rem] grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-[0.65rem] font-semibold text-primary">
                {step.step}
              </span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/scale-your-team">Request Engineering Talent</Link>
          </Button>
        </div>
      </Section>

      <EngagementModels />

      <CTASection
        title="Ready to scale your engineering team?"
        text="Tell us the skills, seniority, and timeline you need. We will come back with a route to get there."
        primaryLabel="Scale Your Team"
        primaryTo="/scale-your-team"
      />
    </>
  );
}
