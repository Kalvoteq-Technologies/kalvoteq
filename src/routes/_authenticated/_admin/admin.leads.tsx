import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Inbox } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  careerApplicationsQuery,
  LEAD_STATUS_LABELS,
  projectRequestsQuery,
  setCareerApplicationStatus,
  setProjectRequestStatus,
  setTalentRequestStatus,
  talentRequestsQuery,
  type CareerApplicationLead,
  type LeadStatus,
  type ProjectRequestLead,
  type TalentRequestLead,
} from "@/lib/leads";
import { listTeam, type TeamMember } from "@/lib/team.functions";
import { cn } from "@/lib/utils";

function useClients() {
  const fetchTeam = useServerFn(listTeam);
  return useQuery({
    queryKey: ["team", "clients"],
    queryFn: async () => {
      const team = await fetchTeam();
      return team.filter((m) => m.roles.includes("client"));
    },
  });
}

function findClientByEmail(clients: TeamMember[], email: string): TeamMember | undefined {
  return clients.find((c) => c.email?.toLowerCase() === email.toLowerCase());
}

export const Route = createFileRoute("/_authenticated/_admin/admin/leads")({
  head: () => ({
    meta: [
      { title: "Leads — kalvoteq Admin" },
      {
        name: "description",
        content: "Talent requests, project requests, and career applications submitted through the site.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

const STATUSES: LeadStatus[] = ["new", "contacted", "archived"];

function StatusButtons({
  current,
  onChange,
  disabled,
}: {
  current: LeadStatus;
  onChange: (status: LeadStatus) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          disabled={disabled}
          onClick={() => onChange(status)}
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs transition-colors disabled:opacity-50",
            current === status
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LEAD_STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-16 text-center">
      <Inbox className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 font-semibold">No {label} yet</p>
    </div>
  );
}

function TalentRequestsList() {
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery(talentRequestsQuery());
  const { data: clients = [] } = useClients();
  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: LeadStatus }) =>
      setTalentRequestStatus(vars.id, vars.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "talent-requests"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Could not update status"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (leads.length === 0) return <EmptyState label="talent requests" />;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {leads.map((lead: TalentRequestLead) => {
        const client = findClientByEmail(clients, lead.business_email);
        return (
          <li key={lead.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {lead.full_name} <span className="font-normal text-muted-foreground">— {lead.company}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{lead.business_email} · {lead.country}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">{lead.required_role}</span> · {lead.seniority} ·{" "}
                {lead.number_of_engineers} engineer(s) · {lead.technology_stack}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{lead.project_description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Start: {lead.expected_start_date} · Duration: {lead.expected_engagement_duration} ·
                Overlap: {lead.preferred_timezone_overlap}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {new Date(lead.created_at).toLocaleString("en-GB")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusButtons
                current={lead.status}
                disabled={mutation.isPending}
                onChange={(status) => mutation.mutate({ id: lead.id, status })}
              />
              {client ? (
                <Button asChild size="sm" variant="outline">
                  <Link
                    to="/admin/delivery"
                    search={{
                      clientId: client.id,
                      name: `${lead.company} — ${lead.required_role} engagement`,
                      summary: lead.project_description,
                    }}
                  >
                    Create project
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">No client account yet</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProjectRequestsList() {
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery(projectRequestsQuery());
  const { data: clients = [] } = useClients();
  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: LeadStatus }) =>
      setProjectRequestStatus(vars.id, vars.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "project-requests"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Could not update status"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (leads.length === 0) return <EmptyState label="project requests" />;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {leads.map((lead: ProjectRequestLead) => {
        const client = findClientByEmail(clients, lead.business_email);
        return (
          <li key={lead.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {lead.name} <span className="font-normal text-muted-foreground">— {lead.company}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{lead.business_email}</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">{lead.project_type}</span> · {lead.current_stage} ·{" "}
                {lead.expected_timeline} · {lead.approximate_budget_range}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{lead.project_description}</p>
              {lead.required_technologies && (
                <p className="mt-2 text-xs text-muted-foreground">Tech: {lead.required_technologies}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {new Date(lead.created_at).toLocaleString("en-GB")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusButtons
                current={lead.status}
                disabled={mutation.isPending}
                onChange={(status) => mutation.mutate({ id: lead.id, status })}
              />
              {client ? (
                <Button asChild size="sm" variant="outline">
                  <Link
                    to="/admin/delivery"
                    search={{
                      clientId: client.id,
                      name: `${lead.company} — ${lead.project_type}`,
                      summary: lead.project_description,
                    }}
                  >
                    Create project
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">No client account yet</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CareerApplicationsList() {
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading } = useQuery(careerApplicationsQuery());
  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: LeadStatus }) =>
      setCareerApplicationStatus(vars.id, vars.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leads", "career-applications"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Could not update status"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (leads.length === 0) return <EmptyState label="applications" />;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {leads.map((lead: CareerApplicationLead) => (
        <li key={lead.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{lead.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{lead.email} · {lead.role}</p>
            <p className="mt-2 text-sm text-muted-foreground">{lead.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Submitted {new Date(lead.created_at).toLocaleString("en-GB")}
            </p>
          </div>
          <StatusButtons
            current={lead.status}
            disabled={mutation.isPending}
            onChange={(status) => mutation.mutate({ id: lead.id, status })}
          />
        </li>
      ))}
    </ul>
  );
}

function LeadsPage() {
  const [tab, setTab] = useState<"talent" | "project" | "career">("talent");
  const { data: talentLeads = [] } = useQuery(talentRequestsQuery());
  const { data: projectLeads = [] } = useQuery(projectRequestsQuery());
  const { data: careerLeads = [] } = useQuery(careerApplicationsQuery());

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Leads"
        intro="Talent requests, project requests, and career applications submitted through the site."
      >
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to articles
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/team">Team & access</Link>
        </Button>
      </PageHero>

      <Section>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="talent">Talent requests ({talentLeads.length})</TabsTrigger>
            <TabsTrigger value="project">Project requests ({projectLeads.length})</TabsTrigger>
            <TabsTrigger value="career">Applications ({careerLeads.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-10">
          {tab === "talent" && <TalentRequestsList />}
          {tab === "project" && <ProjectRequestsList />}
          {tab === "career" && <CareerApplicationsList />}
        </div>
      </Section>
    </>
  );
}
