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
import { submitTalentRequest } from "@/lib/talent-request.functions";

export const Route = createFileRoute("/scale-your-team")({
  head: () => ({
    meta: [
      { title: "Scale Your Team — kalvoteq" },
      {
        name: "description",
        content:
          "Access experienced software engineers and technology specialists who integrate with your existing organization, workflows and engineering culture.",
      },
      { property: "og:title", content: "Scale Your Team — kalvoteq" },
      {
        property: "og:description",
        content: "Request dedicated engineers or a complete engineering squad.",
      },
      { property: "og:url", content: "/scale-your-team" },
    ],
    links: [{ rel: "canonical", href: "/scale-your-team" }],
  }),
  component: ScaleYourTeamPage,
});

const talentRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  businessEmail: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(2, "Please enter your company").max(120),
  country: z.string().trim().min(2, "Please enter your country").max(100),
  requiredRole: z.string().trim().min(2, "Tell us the role you need").max(150),
  requiredSkills: z.string().trim().min(2, "List the required skills").max(500),
  technologyStack: z.string().trim().min(2, "Tell us the technology stack").max(300),
  numberOfEngineers: z.string().trim().min(1, "Select a number of engineers"),
  seniority: z.string().trim().min(1, "Select a seniority level"),
  expectedStartDate: z.string().trim().min(1, "Tell us your expected start date").max(50),
  expectedEngagementDuration: z.string().trim().min(1, "Tell us the expected duration").max(100),
  preferredTimezoneOverlap: z
    .string()
    .trim()
    .min(1, "Tell us your preferred time-zone overlap")
    .max(150),
  projectDescription: z
    .string()
    .trim()
    .min(20, "Please add a little detail (20+ characters)")
    .max(2000),
  additionalInformation: z.string().trim().max(2000).optional(),
});

const emptyValues = {
  fullName: "",
  businessEmail: "",
  company: "",
  country: "",
  requiredRole: "",
  requiredSkills: "",
  technologyStack: "",
  numberOfEngineers: "",
  seniority: "",
  expectedStartDate: "",
  expectedEngagementDuration: "",
  preferredTimezoneOverlap: "",
  projectDescription: "",
  additionalInformation: "",
};

function TalentRequestForm() {
  const submitRequest = useServerFn(submitTalentRequest);

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
          Our team will review your requirements and contact you to discuss the appropriate
          engineering setup.
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
        const parsed = talentRequestSchema.safeParse(values);
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
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={values.fullName}
            onChange={update("fullName")}
            maxLength={100}
          />
          {errors["fullName"] && <p className="text-sm text-destructive">{errors["fullName"]}</p>}
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
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" value={values.company} onChange={update("company")} maxLength={120} />
          {errors["company"] && <p className="text-sm text-destructive">{errors["company"]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={values.country} onChange={update("country")} maxLength={100} />
          {errors["country"] && <p className="text-sm text-destructive">{errors["country"]}</p>}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="requiredRole">Required role</Label>
        <Input
          id="requiredRole"
          placeholder="e.g. Senior React Developer"
          value={values.requiredRole}
          onChange={update("requiredRole")}
          maxLength={150}
        />
        {errors["requiredRole"] && (
          <p className="text-sm text-destructive">{errors["requiredRole"]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="requiredSkills">Required skills</Label>
        <Input
          id="requiredSkills"
          value={values.requiredSkills}
          onChange={update("requiredSkills")}
          maxLength={500}
        />
        {errors["requiredSkills"] && (
          <p className="text-sm text-destructive">{errors["requiredSkills"]}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="technologyStack">Technology stack</Label>
        <Input
          id="technologyStack"
          value={values.technologyStack}
          onChange={update("technologyStack")}
          maxLength={300}
        />
        {errors["technologyStack"] && (
          <p className="text-sm text-destructive">{errors["technologyStack"]}</p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="numberOfEngineers">Number of engineers</Label>
          <Select
            value={values.numberOfEngineers}
            onValueChange={(v) => setValues((prev) => ({ ...prev, numberOfEngineers: v }))}
          >
            <SelectTrigger id="numberOfEngineers">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {["1", "2-3", "4-6", "7-10", "10+"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["numberOfEngineers"] && (
            <p className="text-sm text-destructive">{errors["numberOfEngineers"]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="seniority">Seniority</Label>
          <Select
            value={values.seniority}
            onValueChange={(v) => setValues((prev) => ({ ...prev, seniority: v }))}
          >
            <SelectTrigger id="seniority">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {["Junior", "Mid-level", "Senior", "Lead / Principal"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["seniority"] && <p className="text-sm text-destructive">{errors["seniority"]}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="expectedStartDate">Expected start date</Label>
          <Input
            id="expectedStartDate"
            placeholder="e.g. Within 4 weeks"
            value={values.expectedStartDate}
            onChange={update("expectedStartDate")}
            maxLength={50}
          />
          {errors["expectedStartDate"] && (
            <p className="text-sm text-destructive">{errors["expectedStartDate"]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expectedEngagementDuration">Expected engagement duration</Label>
          <Input
            id="expectedEngagementDuration"
            placeholder="e.g. 6 months"
            value={values.expectedEngagementDuration}
            onChange={update("expectedEngagementDuration")}
            maxLength={100}
          />
          {errors["expectedEngagementDuration"] && (
            <p className="text-sm text-destructive">{errors["expectedEngagementDuration"]}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preferredTimezoneOverlap">Preferred time-zone overlap</Label>
        <Input
          id="preferredTimezoneOverlap"
          placeholder="e.g. CET +/- 2 hours"
          value={values.preferredTimezoneOverlap}
          onChange={update("preferredTimezoneOverlap")}
          maxLength={150}
        />
        {errors["preferredTimezoneOverlap"] && (
          <p className="text-sm text-destructive">{errors["preferredTimezoneOverlap"]}</p>
        )}
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
          {submitting ? "Sending…" : "Request Engineering Talent"}
        </Button>
      </div>
    </form>
  );
}

function ScaleYourTeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Scale Your Team"
        title="Scale Your Engineering Team"
        intro="Access experienced software engineers and technology specialists who integrate with your existing organization, workflows and engineering culture."
      />
      <Section eyebrow="Request" title="Tell us what you need">
        <div className="max-w-2xl">
          <TalentRequestForm />
        </div>
      </Section>
    </>
  );
}
