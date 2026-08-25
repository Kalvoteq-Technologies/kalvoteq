import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import { DeveloperDocuments } from "@/components/workspace/DeveloperDocuments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  developerProfileSchema,
  myDeveloperProfileQuery,
  saveDeveloperProfile,
} from "@/lib/member-profiles";

export const Route = createFileRoute("/_authenticated/_developer/workspace-profile")({
  head: () => ({
    meta: [
      { title: "Engineer details — kalvoteq workspace" },
      {
        name: "description",
        content:
          "Share your engineering profile, skills, and availability with the kalvoteq delivery team.",
      },
      { property: "og:title", content: "Engineer details — kalvoteq workspace" },
      { property: "og:description", content: "Complete your kalvoteq developer profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperProfilePage,
});

const empty = {
  headline: "",
  company_name: "",
  years_experience: "0",
  skills: "",
  primary_stack: "",
  availability: "",
  timezone: "",
  github_url: "",
  portfolio_url: "",
};

function DeveloperProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(myDeveloperProfileQuery(user?.id));
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!data) return;
    setForm({
      headline: data.headline ?? "",
      company_name: data.company_name ?? "",
      years_experience: String(data.years_experience ?? 0),
      skills: (data.skills ?? []).join(", "),
      primary_stack: data.primary_stack ?? "",
      availability: data.availability ?? "",
      timezone: data.timezone ?? "",
      github_url: data.github_url ?? "",
      portfolio_url: data.portfolio_url ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = developerProfileSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check your details");
      await saveDeveloperProfile(user!.id, parsed.data);
    },
    onSuccess: async () => {
      toast.success("Engineer details saved");
      await queryClient.invalidateQueries({ queryKey: ["developer-profile", user?.id] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save your details"),
  });

  const set = (key: keyof typeof empty) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHero
        eyebrow="Developer workspace"
        title="Your engineer details"
        intro="Skills, availability, and links so delivery leads can staff you on the right engagements."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <form
            className="space-y-5 rounded-xl border border-border bg-card p-7"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <Field
              id="headline"
              label="Headline"
              required
              placeholder="Senior backend engineer, distributed systems"
              value={form.headline}
              onChange={set("headline")}
              maxLength={140}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="company_name"
                label="Company or agency"
                value={form.company_name}
                onChange={set("company_name")}
                maxLength={120}
              />
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  min={0}
                  max={60}
                  value={form.years_experience}
                  onChange={(e) => set("years_experience")(e.target.value)}
                />
              </div>
              <Field
                id="primary_stack"
                label="Primary stack"
                placeholder="TypeScript / Go / AWS"
                value={form.primary_stack}
                onChange={set("primary_stack")}
                maxLength={120}
              />
              <Field
                id="availability"
                label="Availability"
                placeholder="Full-time from September"
                value={form.availability}
                onChange={set("availability")}
                maxLength={60}
              />
              <Field
                id="timezone"
                label="Timezone"
                placeholder="EET (UTC+2)"
                value={form.timezone}
                onChange={set("timezone")}
                maxLength={60}
              />
              <Field
                id="github_url"
                label="GitHub"
                placeholder="https://github.com/…"
                value={form.github_url}
                onChange={set("github_url")}
                maxLength={255}
              />
            </div>
            <Field
              id="portfolio_url"
              label="Portfolio"
              placeholder="https://"
              value={form.portfolio_url}
              onChange={set("portfolio_url")}
              maxLength={255}
            />
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                rows={3}
                maxLength={400}
                value={form.skills}
                onChange={(e) => set("skills")(e.target.value)}
                placeholder="Comma separated, e.g. React, PostgreSQL, Kubernetes"
              />
              <p className="text-xs text-muted-foreground">Separate each skill with a comma.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={save.isPending || isLoading}>
                {data ? "Save changes" : "Complete profile"}
              </Button>
              <Button asChild variant="ghost">
                <Link to="/workspace">Back to workspace</Link>
              </Button>
            </div>
          </form>

          <aside className="h-fit rounded-xl border border-border bg-surface p-6 lg:row-start-1 lg:col-start-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold">Who can see this</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>You — full access to your details and documents.</li>
              <li>kalvoteq admins — full access, including your CV and portfolio files.</li>
              <li>Clients never see engineer profiles or documents.</li>
              <li>Nobody else, including signed-out visitors.</li>
            </ul>
          </aside>

          <div className="lg:col-start-1">
            <DeveloperDocuments userId={user?.id} />
          </div>
        </div>
      </Section>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
