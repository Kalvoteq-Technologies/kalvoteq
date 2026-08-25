import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { industries, type Industry } from "@/data/site";

export const Route = createFileRoute("/industries/$slug")({
  loader: ({ params }) => {
    const industry = industries.find((i) => i.slug === params.slug);
    if (!industry) throw notFound();
    return { industry };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Industry not found — kalvoteq" }, { name: "robots", content: "noindex" }] };
    }
    const { industry } = loaderData;
    return {
      meta: [
        { title: `${industry.name} Software Consulting — kalvoteq` },
        { name: "description", content: industry.blurb },
        { property: "og:title", content: `${industry.name} Software Consulting — kalvoteq` },
        { property: "og:description", content: industry.blurb },
        { property: "og:url", content: `/industries/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/industries/${params.slug}` }],
    };
  },
  component: IndustryDetail,
});

function IndustryDetail() {
  const { industry } = Route.useLoaderData() as { industry: Industry };

  return (
    <>
      <PageHero eyebrow="Industry" title={industry.name} intro={industry.blurb}>
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/industries" className="hover:text-foreground">
            Industries
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{industry.name}</span>
        </nav>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold">Challenges</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {industry.challenges.map((c) => (
                <li key={c} className="border-l-2 border-destructive/40 pl-4">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold">How we solve them</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {industry.solutions.map((s) => (
                <li key={s} className="border-l-2 border-accent pl-4">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section eyebrow="Technology" title="Relevant technologies" muted>
        <div className="flex flex-wrap gap-2">
          {industry.technologies.map((t) => (
            <Badge key={t} variant="outline" className="bg-background px-3 py-1.5 text-sm font-normal">
              {t}
            </Badge>
          ))}
        </div>
      </Section>

      <Section eyebrow="Outcomes" title="Business results we have delivered">
        <div className="grid gap-6 md:grid-cols-3">
          {industry.outcomes.map((o) => (
            <div key={o} className="rounded-lg border border-border bg-card p-6 text-sm leading-relaxed">
              {o}
            </div>
          ))}
        </div>
      </Section>

      <CTASection title={`Planning a ${industry.name.toLowerCase()} initiative?`} />
    </>
  );
}
