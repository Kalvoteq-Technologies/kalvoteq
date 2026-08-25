import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CompanyLogoUpload } from "@/components/portal/CompanyLogoUpload";
import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { clientProfileSchema, myClientProfileQuery, saveClientProfile } from "@/lib/member-profiles";

export const Route = createFileRoute("/_authenticated/_client/portal-profile")({
  head: () => ({
    meta: [
      { title: "Company details — kalvoteq client portal" },
      { name: "description", content: "Share your company details so the kalvoteq delivery team can tailor your engagement." },
      { property: "og:title", content: "Company details — kalvoteq client portal" },
      { property: "og:description", content: "Complete your kalvoteq client profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientProfilePage,
});

const empty = {
  company_name: "",
  website: "",
  industry: "",
  company_size: "",
  country: "",
  role_title: "",
  needs: "",
};

function ClientProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(myClientProfileQuery(user?.id));
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!data) return;
    setForm({
      company_name: data.company_name ?? "",
      website: data.website ?? "",
      industry: data.industry ?? "",
      company_size: data.company_size ?? "",
      country: data.country ?? "",
      role_title: data.role_title ?? "",
      needs: data.needs ?? "",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = clientProfileSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check your details");
      await saveClientProfile(user!.id, parsed.data);
    },
    onSuccess: async () => {
      toast.success("Company details saved");
      await queryClient.invalidateQueries({ queryKey: ["client-profile", user?.id] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save your details"),
  });

  const set = (key: keyof typeof empty) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title="Your company details"
        intro="Tell us who you are and what you are building. Your delivery lead and the engineers on your engagement use this to prepare."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
          <CompanyLogoUpload userId={user?.id} logoPath={data?.logo_path} hasProfile={Boolean(data)} />
          <form
            className="space-y-5 rounded-xl border border-border bg-card p-7"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <Field id="company_name" label="Company name" required value={form.company_name} onChange={set("company_name")} maxLength={120} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="website" label="Website" placeholder="https://" value={form.website} onChange={set("website")} maxLength={255} />
              <Field id="industry" label="Industry" value={form.industry} onChange={set("industry")} maxLength={120} />
              <Field id="company_size" label="Company size" placeholder="e.g. 50–200" value={form.company_size} onChange={set("company_size")} maxLength={60} />
              <Field id="country" label="Country" value={form.country} onChange={set("country")} maxLength={80} />
            </div>
            <Field id="role_title" label="Your role" value={form.role_title} onChange={set("role_title")} maxLength={120} />
            <div className="space-y-2">
              <Label htmlFor="needs">What do you need help with?</Label>
              <Textarea
                id="needs"
                rows={5}
                maxLength={1000}
                value={form.needs}
                onChange={(e) => set("needs")(e.target.value)}
                placeholder="Goals, current stack, timeline, and anything blocking you today."
              />
              <p className="text-xs text-muted-foreground">{form.needs.length}/1000</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={save.isPending || isLoading}>
                {data ? "Save changes" : "Complete profile"}
              </Button>
              <Button asChild variant="ghost">
                <Link to="/portal">Back to portal</Link>
              </Button>
            </div>
          </form>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-surface p-6">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold">Who can see this</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>You — full access, any time.</li>
              <li>kalvoteq admins — full access.</li>
              <li>Engineers on the delivery team — to prepare for your engagement.</li>
              <li>Nobody else, including signed-out visitors.</li>
            </ul>
          </aside>
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
      <Input id={id} value={value} required={required} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
