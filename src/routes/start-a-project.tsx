import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHero, Section } from "@/components/site/Primitives";
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
import { services } from "@/data/site";
import { submitProjectRequest } from "@/lib/project-request.functions";

export const Route = createFileRoute("/start-a-project")({
  head: () => ({
    meta: [
      { title: "Start a Project — kalvoteq" },
      {
        name: "description",
        content:
          "Tell us about the software you need to build, modernize or integrate, and our engineering team will come back with a route to get there.",
      },
      { property: "og:title", content: "Start a Project — kalvoteq" },
      {
        property: "og:description",
        content: "Request a project engagement with Kalvoteq's engineering team.",
      },
      { property: "og:url", content: "/start-a-project" },
    ],
    links: [{ rel: "canonical", href: "/start-a-project" }],
  }),
  component: StartAProjectPage,
});

const projectRequestSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  company: z.string().trim().min(2, "Please enter your company").max(120),
  businessEmail: z.string().trim().email("Enter a valid work email").max(255),
  projectType: z.string().trim().min(1, "Select a project type"),
  projectDescription: z
    .string()
    .trim()
    .min(20, "Please add a little detail (20+ characters)")
    .max(2000),
  currentStage: z.string().trim().min(1, "Select your current stage"),
  expectedTimeline: z.string().trim().min(1, "Tell us your expected timeline").max(100),
  approximateBudgetRange: z.string().trim().min(1, "Select an approximate budget range"),
  requiredTechnologies: z.string().trim().max(300).optional(),
  additionalInformation: z.string().trim().max(2000).optional(),
});

const emptyValues = {
  name: "",
  company: "",
  businessEmail: "",
  projectType: "",
  projectDescription: "",
  currentStage: "",
  expectedTimeline: "",
  approximateBudgetRange: "",
  requiredTechnologies: "",
  additionalInformation: "",
};

function ProjectRequestForm() {
  const submitRequest = useServerFn(submitProjectRequest);

  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update =
    (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <h2 className="text-xl font-semibold">Thank you.</h2>
        <p className="mt-3 text-muted-foreground">
          We will review your project and reply within one business day with next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 rounded-xl border border-border bg-card p-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = projectRequestSchema.safeParse(values);
        if (!parsed.success) {
          const next: Record<string, string> = {};
          for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
          setErrors(next);
          return;
        }
        setErrors({});
        setSubmitting(true);
        void submitRequest({ data: parsed.data })
          .then(() => setSubmitted(true))
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
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={values.company} onChange={update("company")} maxLength={120} />
          {errors["company"] && <p className="text-sm text-destructive">{errors["company"]}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="businessEmail">Business email</Label>
        <Input
          id="businessEmail"
          type="email"
          value={values.businessEmail}
          onChange={update("businessEmail")}
          maxLength={255}
        />
        {errors["businessEmail"] && (
          <p className="text-sm text-destructive">{errors["businessEmail"]}</p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="projectType">Project type</Label>
          <Select
            value={values.projectType}
            onValueChange={(v) => setValues((prev) => ({ ...prev, projectType: v }))}
          >
            <SelectTrigger id="projectType">
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
          {errors["projectType"] && (
            <p className="text-sm text-destructive">{errors["projectType"]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentStage">Current stage</Label>
          <Select
            value={values.currentStage}
            onValueChange={(v) => setValues((prev) => ({ ...prev, currentStage: v }))}
          >
            <SelectTrigger id="currentStage">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Idea / discovery",
                "Requirements defined",
                "In progress, need help",
                "Existing system to modernize",
              ].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["currentStage"] && (
            <p className="text-sm text-destructive">{errors["currentStage"]}</p>
          )}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="expectedTimeline">Expected timeline</Label>
          <Input
            id="expectedTimeline"
            placeholder="e.g. 3-6 months"
            value={values.expectedTimeline}
            onChange={update("expectedTimeline")}
            maxLength={100}
          />
          {errors["expectedTimeline"] && (
            <p className="text-sm text-destructive">{errors["expectedTimeline"]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="approximateBudgetRange">Approximate budget range</Label>
          <Select
            value={values.approximateBudgetRange}
            onValueChange={(v) => setValues((prev) => ({ ...prev, approximateBudgetRange: v }))}
          >
            <SelectTrigger id="approximateBudgetRange">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Under €25k",
                "€25k-€50k",
                "€50k-€100k",
                "€100k-€250k",
                "€250k+",
                "Not yet defined",
              ].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["approximateBudgetRange"] && (
            <p className="text-sm text-destructive">{errors["approximateBudgetRange"]}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="requiredTechnologies">Required technologies (if known)</Label>
        <Input
          id="requiredTechnologies"
          value={values.requiredTechnologies}
          onChange={update("requiredTechnologies")}
          maxLength={300}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="projectDescription">Project description</Label>
        <Textarea
          id="projectDescription"
          rows={5}
          value={values.projectDescription}
          onChange={update("projectDescription")}
          maxLength={2000}
        />
        {errors["projectDescription"] && (
          <p className="text-sm text-destructive">{errors["projectDescription"]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="additionalInformation">Additional information</Label>
        <Textarea
          id="additionalInformation"
          rows={3}
          value={values.additionalInformation}
          onChange={update("additionalInformation")}
          maxLength={2000}
        />
      </div>
      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Start a Project"}
        </Button>
      </div>
    </form>
  );
}

function StartAProjectPage() {
  return (
    <>
      <PageHero
        eyebrow="Start a Project"
        title="Tell us what you are building"
        intro="Share your project and our engineering team will come back within one business day with a route to get there."
      />
      <Section eyebrow="Project details" title="Start a project">
        <div className="max-w-2xl">
          <ProjectRequestForm />
        </div>
      </Section>
    </>
  );
}
