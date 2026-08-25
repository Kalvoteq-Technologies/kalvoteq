import { createFileRoute } from "@tanstack/react-router";

import { CTASection, PageHero, Section, Stat } from "@/components/site/Primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, leadership, values } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About kalvoteq — Estonian Software Consulting Firm" },
      {
        name: "description",
        content:
          "Our mission, values, leadership, and global delivery model. Headquartered in Tallinn, Estonia, delivering across Europe, the UK, North America, and Africa.",
      },
      { property: "og:title", content: "About kalvoteq — Estonian Software Consulting Firm" },
      { property: "og:description", content: "Senior engineers, transparent delivery, and a decade of building systems that last." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="An engineering firm, run by engineers"
        intro="kalvoteq exists because too much enterprise software is sold by people who will never maintain it. We build what we recommend, and we stay long enough to be accountable for it."
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

      <Section eyebrow="Story" title="How we got here">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              kalvoteq started in Tallinn with four engineers who had spent a decade inside banking
              and healthcare platforms, and had watched enough failed programmes to know what caused
              them: distance between the people deciding and the people building.
            </p>
            <p>
              We kept the structure deliberately flat. Every engagement has a named tech lead who is
              in the code, an engagement manager who is in the numbers, and no layer between them and
              the client. Today the firm spans more than eighty engineers across Europe, delivering
              for organisations in the UK, the Nordics, North America, and West Africa.
            </p>
            <p>
              We have never taken outside investment, which means we choose engagements on fit rather
              than on quota.
            </p>
          </div>
          <div className="grid gap-6">
            <Stat value="2016" label="Founded in Tallinn" />
            <Stat value="80+" label="Engineers and designers" />
            <Stat value="14" label="Countries delivered into" />
          </div>
        </div>
      </Section>

      <Section eyebrow="Delivery" title="Global delivery model" muted>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Nearshore core", d: "Delivery hubs in Estonia, Poland, and Portugal with full European time-zone overlap." },
            { t: "Follow-the-sun support", d: "Operations coverage extended through partner teams in Nairobi and Toronto." },
            { t: "One process", d: "Same engineering standards, review gates, and reporting regardless of location." },
          ].map((item) => (
            <div key={item.t} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-semibold">{item.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Leadership" title="Who you will work with">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map((p) => (
            <div key={p.name} className="rounded-lg border border-border bg-card p-6">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-sm font-bold text-ink-foreground">
                {p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h3 className="mt-4 font-semibold">{p.name}</h3>
              <p className="text-sm text-primary">{p.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Why Estonia" title="A digital state as a home base" muted>
        <div className="grid gap-10 lg:grid-cols-2">
          <p className="text-base leading-relaxed text-muted-foreground">
            Estonia has run public services digitally since 2001. That environment produced engineers
            who treat identity, interoperability, and security as defaults rather than features — and
            a regulatory culture that makes EU-compliant delivery straightforward.
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="border-l-2 border-accent pl-4">EU jurisdiction and GDPR-native data handling</li>
            <li className="border-l-2 border-accent pl-4">e-Residency and fully digital contracting</li>
            <li className="border-l-2 border-accent pl-4">Deep talent pool in security and distributed systems</li>
            <li className="border-l-2 border-accent pl-4">Time zone overlapping Europe, the UK, and East Africa</li>
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
