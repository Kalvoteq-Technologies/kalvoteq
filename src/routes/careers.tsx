import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { CTASection, PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { openRoles } from "@/data/site";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at kalvoteq — Engineering Jobs in Europe" },
      {
        name: "description",
        content: "Open engineering, design, and delivery roles in Tallinn and remote across the EU. Senior-first culture, transparent pay bands.",
      },
      { property: "og:title", content: "Careers at kalvoteq" },
      { property: "og:description", content: "Join a senior-first software consulting firm headquartered in Estonia." },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: CareersPage,
});

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  role: z.string().trim().min(2, "Tell us which role").max(120),
  message: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(2000),
});

function ApplicationForm() {
  const [values, setValues] = useState({ name: "", email: "", role: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      className="grid max-w-2xl gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = applicationSchema.safeParse(values);
        if (!parsed.success) {
          const next: Record<string, string> = {};
          for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
          setErrors(next);
          return;
        }
        setErrors({});
        setSubmitting(true);
        window.setTimeout(() => {
          setSubmitting(false);
          setValues({ name: "", email: "", role: "", message: "" });
          toast.success("Application received. Our talent team replies within three working days.");
        }, 600);
      }}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="app-name">Full name</Label>
          <Input id="app-name" value={values.name} onChange={update("name")} maxLength={100} />
          {errors["name"] && <p className="text-sm text-destructive">{errors["name"]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="app-email">Email</Label>
          <Input id="app-email" type="email" value={values.email} onChange={update("email")} maxLength={255} />
          {errors["email"] && <p className="text-sm text-destructive">{errors["email"]}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="app-role">Role you are applying for</Label>
        <Input id="app-role" value={values.role} onChange={update("role")} maxLength={120} />
        {errors["role"] && <p className="text-sm text-destructive">{errors["role"]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="app-message">Why you, and a link to your work</Label>
        <Textarea id="app-message" rows={5} value={values.message} onChange={update("message")} maxLength={2000} />
        {errors["message"] && <p className="text-sm text-destructive">{errors["message"]}</p>}
      </div>
      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}

function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Work with engineers who set the standard, not the schedule"
        intro="We hire senior, pay transparently, and protect focus. No timesheet theatre, no bench, no surprise reassignments."
      />

      <Section eyebrow="Open roles" title={`${openRoles.length} positions open`}>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {openRoles.map((role) => (
            <li key={role.title} className="flex flex-col gap-3 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">{role.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {role.team} · {role.location}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{role.type}</Badge>
                <Button asChild variant="outline" size="sm">
                  <a href="#apply">Apply</a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Benefits" title="What we offer" muted>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Transparent pay bands", d: "Published bands per level. No negotiation lottery." },
            { t: "Learning budget", d: "€2,500 per year plus conference time, no approval theatre." },
            { t: "Remote-first EU", d: "Work anywhere in the EU with quarterly team weeks in Tallinn." },
            { t: "Health and wellbeing", d: "Private health cover and a monthly wellbeing allowance." },
            { t: "Real time off", d: "30 days paid leave, and we track that you take it." },
            { t: "Equipment", d: "Your choice of machine, refreshed every three years." },
          ].map((b) => (
            <div key={b.t} className="rounded-lg border border-border bg-card p-7">
              <h3 className="font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Hiring process" title="Four steps, two weeks">
        <ol className="grid gap-6 md:grid-cols-4">
          {[
            { s: "01", t: "Intro call", d: "30 minutes with the talent team on context and expectations." },
            { s: "02", t: "Technical conversation", d: "Live system design and code discussion — no take-home puzzles." },
            { s: "03", t: "Team session", d: "Meet the practice lead and two future colleagues." },
            { s: "04", t: "Offer", d: "Written offer with band, level, and growth path attached." },
          ].map((step) => (
            <li key={step.s} className="rounded-lg border border-border bg-card p-6">
              <span className="text-xs font-semibold text-primary">{step.s}</span>
              <h3 className="mt-2 font-semibold">{step.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="Culture" title="Life at kalvoteq" muted>
        <div className="grid gap-10 lg:grid-cols-2">
          <p className="text-base leading-relaxed text-muted-foreground">
            We are a small firm by design. Decisions are made in writing, reviewed openly, and
            revisited when evidence changes. Engineers talk to clients directly — there is no account
            layer translating requirements into ambiguity.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            Team weeks in Tallinn happen quarterly: two days of planning, one day of internal
            engineering work, and an evening in the old town. The rest of the year, we protect deep
            work and keep meetings to what a written update cannot handle.
          </p>
        </div>
      </Section>

      <Section eyebrow="Apply" title="Send us your application" className="scroll-mt-24">
        <div id="apply">
          <ApplicationForm />
        </div>
      </Section>

      <CTASection title="Not seeing your role?" text="We keep speculative applications on file for six months and review them every hiring cycle." />
    </>
  );
}
