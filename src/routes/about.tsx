import { createFileRoute } from "@tanstack/react-router";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, values } from "@/data/site";
import { faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About kalvoteq — European Engineering & Technology Consulting" },
      {
        name: "description",
        content:
          "Kalvoteq is an Estonia-based engineering and technology consulting company helping organizations build software, modernize technology, and access experienced engineering capability.",
      },
      {
        property: "og:title",
        content: "About kalvoteq — European Engineering & Technology Consulting",
      },
      {
        property: "og:description",
        content: "Technology Consulting, Software Engineering, and Global Engineering Talent.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="An engineering firm, run by engineers"
        intro="Kalvoteq is an Estonia-based engineering and technology consulting company. We build what we recommend, and we stay long enough to be accountable for it."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="eyebrow">Mission</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug">
              Help organizations build, modernize and scale digital products using world-class
              engineering teams.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="eyebrow">Vision</p>
            <p className="mt-4 font-display text-2xl font-semibold leading-snug">
              Become one of Europe's leading software consulting companies with global delivery
              capabilities.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Values" title="What we hold to" muted>
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Story" title="How we work">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Kalvoteq combines technology consulting, software engineering, and global engineering
            talent to help organizations move from technology strategy to execution. We keep the
            structure deliberately flat: every engagement has a named tech lead who is in the code,
            an engagement manager who is in the numbers, and no layer between them and the client.
          </p>
          <p>
            We work in two ways. Where an organisation needs the technology delivered, we design,
            build, and take responsibility for the outcome. Where an organisation already has the
            initiative underway and needs engineering capacity, we provide experienced engineers and
            teams who integrate directly into how that organisation already works.
          </p>
        </div>
      </Section>

      <Section eyebrow="Delivery" title="European company, global engineering capability" muted>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Estonian headquarters",
              d: "Kalvoteq is headquartered in Tallinn, Estonia, where engagement management and delivery standards are set.",
            },
            {
              t: "Global engineering talent",
              d: "We work with experienced engineers across multiple countries, matched to each engagement's skill and time-zone requirements.",
            },
            {
              t: "One delivery standard",
              d: "Every engagement follows the same engineering standards, review gates, and reporting regardless of where the engineer is based.",
            },
          ].map((item) => (
            <div key={item.t} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-semibold">{item.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Why Estonia" title="A digital state as a home base" muted>
        <div className="grid gap-10 lg:grid-cols-2">
          <p className="text-base leading-relaxed text-muted-foreground">
            Estonia has run public services digitally since 2001. That environment produced
            engineers who treat identity, interoperability, and security as defaults rather than
            features — and a regulatory culture that makes EU-compliant delivery straightforward.
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="border-l-2 border-accent pl-4">
              EU jurisdiction and GDPR-native data handling
            </li>
            <li className="border-l-2 border-accent pl-4">
              e-Residency and fully digital contracting
            </li>
            <li className="border-l-2 border-accent pl-4">
              Deep talent pool in security and distributed systems
            </li>
            <li className="border-l-2 border-accent pl-4">
              Time zone overlapping Europe, the UK, and East Africa
            </li>
          </ul>
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Frequently asked questions">
        <Accordion type="single" collapsible className="max-w-3xl">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <CTASection />
    </>
  );
}
