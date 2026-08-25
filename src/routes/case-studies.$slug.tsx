import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Quote } from "lucide-react";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { caseStudies, caseStudyTypeLabel, type CaseStudy } from "@/data/site";
import { breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: ({ params }) => {
    const study = caseStudies.find((c) => c.slug === params.slug);
    if (!study) throw notFound();
    return { study };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Case study not found — kalvoteq" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { study } = loaderData;
    return {
      meta: [
        { title: `${study.title} — kalvoteq Case Study` },
        { name: "description", content: study.problem },
        { property: "og:title", content: study.title },
        { property: "og:description", content: study.problem },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/case-studies/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/case-studies/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Case Studies", url: "/case-studies" },
              { name: study.title, url: `/case-studies/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: CaseStudyDetail,
});

function CaseStudyDetail() {
  const { study } = Route.useLoaderData() as { study: CaseStudy };
  const related = caseStudies.filter((c) => c.slug !== study.slug);

  return (
    <>
      <PageHero eyebrow={study.sector} title={study.title} intro={study.client}>
        <Badge variant="outline" className="mb-4 font-normal">
          {caseStudyTypeLabel[study.type]}
        </Badge>
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/case-studies" className="hover:text-foreground">
            Case Studies
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{study.sector}</span>
        </nav>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold">The problem</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {study.problem}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">What we did</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {study.solution}
              </p>
            </div>
            <figure className="rounded-xl border border-border bg-surface p-8">
              <Quote className="h-6 w-6 text-primary" aria-hidden="true" />
              <blockquote className="mt-4 font-display text-xl font-semibold leading-snug">
                "{study.quote.text}"
              </blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">
                {study.quote.author}, {study.quote.role}
              </figcaption>
            </figure>
          </div>

          <aside className="space-y-8 rounded-xl border border-border bg-card p-8 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="eyebrow">Timeline</p>
              <p className="mt-2 font-display text-lg font-semibold">{study.timeline}</p>
            </div>
            <div>
              <p className="eyebrow">Technology</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {study.technologies.map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow">Results</p>
              <dl className="mt-3 space-y-3">
                {study.results.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-baseline justify-between gap-4 border-b border-border pb-2"
                  >
                    <dt className="text-sm text-muted-foreground">{r.label}</dt>
                    <dd className="font-display font-bold">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Related" title="More work" muted>
        <div className="grid gap-6 md:grid-cols-2">
          {related.map((cs) => (
            <Link
              key={cs.slug}
              to="/case-studies/$slug"
              params={{ slug: cs.slug }}
              className="rounded-xl border border-border bg-card p-7 card-hover"
            >
              <Badge variant="secondary" className="w-fit">
                {cs.sector}
              </Badge>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{cs.title}</h3>
            </Link>
          ))}
        </div>
      </Section>

      <CTASection />
    </>
  );
}
