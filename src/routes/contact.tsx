import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { submitContactEnquiry } from "@/lib/contact.functions";

import { Calendar, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHero, Section } from "@/components/site/Primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { company, faqs, services } from "@/data/site";
import { faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact kalvoteq — Talk to an Expert" },
      {
        name: "description",
        content:
          "Talk to our engineering leadership in Tallinn. We reply to every enquiry within one business day.",
      },
      { property: "og:title", content: "Contact kalvoteq — Talk to an Expert" },
      { property: "og:description", content: "Headquartered in Tallinn, Estonia." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd(faqs)) }],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  companyName: z.string().trim().min(2, "Please enter your company").max(120),
  interest: z.string().trim().min(1, "Select what you need help with"),
  message: z.string().trim().min(20, "Please add a little detail (20+ characters)").max(2000),
});

function ContactForm() {
  const submitEnquiry = useServerFn(submitContactEnquiry);

  const [values, setValues] = useState({
    name: "",
    email: "",
    companyName: "",
    interest: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form
      className="grid gap-5 rounded-xl border border-border bg-card p-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = contactSchema.safeParse(values);
        if (!parsed.success) {
          const next: Record<string, string> = {};
          for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
          setErrors(next);
          return;
        }
        setErrors({});
        setSubmitting(true);
        void submitEnquiry({ data: parsed.data })
          .then(() => {
            setValues({ name: "", email: "", companyName: "", interest: "", message: "" });
            toast.success("Thank you — we will reply within one business day.");
          })
          .catch(() => {
            toast.error("Something went wrong. Please email hello@kalvoteq.com directly.");
          })
          .finally(() => setSubmitting(false));
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={values.name} onChange={update("name")} maxLength={100} />
          {errors["name"] && <p className="text-sm text-destructive">{errors["name"]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={update("email")}
            maxLength={255}
          />
          {errors["email"] && <p className="text-sm text-destructive">{errors["email"]}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            value={values.companyName}
            onChange={update("companyName")}
            maxLength={120}
          />
          {errors["companyName"] && (
            <p className="text-sm text-destructive">{errors["companyName"]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interest">What do you need?</Label>
          <Select
            value={values.interest}
            onValueChange={(v) => setValues((prev) => ({ ...prev, interest: v }))}
          >
            <SelectTrigger id="interest">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.slug} value={s.title}>
                  {s.title}
                </SelectItem>
              ))}
              <SelectItem value="Something else">Something else</SelectItem>
            </SelectContent>
          </Select>
          {errors["interest"] && <p className="text-sm text-destructive">{errors["interest"]}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Project context</Label>
        <Textarea
          id="message"
          rows={6}
          value={values.message}
          onChange={update("message")}
          maxLength={2000}
        />
        {errors["message"] && <p className="text-sm text-destructive">{errors["message"]}</p>}
      </div>
      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Send enquiry"}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          We use your details only to respond to this enquiry. See our privacy policy.
        </p>
      </div>
    </form>
  );
}

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about what you are building"
        intro="Every enquiry reaches an engineer, not a sales queue. We reply within one business day."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm />

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-7">
              <h2 className="font-semibold">Tallinn office</h2>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">{company.address}</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {company.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <a
                    href={`tel:${company.phone.replace(/\s/g, "")}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {company.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="text-muted-foreground">{company.hours}</span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <iframe
                title="Map of the kalvoteq office at Tornimäe 5, Tallinn"
                src="https://www.openstreetmap.org/export/embed.html?bbox=24.7500%2C59.4295%2C24.7660%2C59.4365&layer=mapnik&marker=59.4330%2C24.7580"
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://www.openstreetmap.org/?mlat=59.4330&mlon=24.7580#map=17/59.4330/24.7580"
                target="_blank"
                rel="noreferrer"
                className="block border-t border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                Open Tornimäe 5, Tallinn in maps →
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Prefer a call?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Book a 30-minute call with an engineer — no sales script, just a technical
                conversation about scope, architecture and timelines. We confirm a slot within one
                business day.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <a href={`mailto:${company.email}?subject=Consultation%20request`}>
                  Request a slot
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Before you write" muted>
        <Accordion type="single" collapsible className="max-w-3xl">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`contact-faq-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  );
}
