import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, LifeBuoy, MessageSquareText, Receipt, Rocket } from "lucide-react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { LEAD_STATUS_LABELS, myProjectRequestsQuery, myTalentRequestsQuery } from "@/lib/leads";
import { myClientProfileQuery } from "@/lib/member-profiles";
import {
  formatDate,
  formatMoney,
  myDeliverablesQuery,
  myInvoicesQuery,
  myProjectsQuery,
  myRequestsQuery,
  PROJECT_STATUS_LABELS,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/_client/portal")({
  head: () => ({
    meta: [
      { title: "Client portal — kalvoteq" },
      {
        name: "description",
        content:
          "Your kalvoteq engagement overview: delivery status, deliverables, requests and invoices.",
      },
      { property: "og:title", content: "Client portal — kalvoteq" },
      { property: "og:description", content: "Track your kalvoteq engagement." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientPortal,
});

function ClientPortal() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery(myClientProfileQuery(user?.id));
  const { data: projects = [], isLoading: projectsLoading } = useQuery(myProjectsQuery(user?.id));
  const { data: deliverables = [] } = useQuery(myDeliverablesQuery(user?.id));
  const { data: requests = [] } = useQuery(myRequestsQuery(user?.id));
  const { data: invoices = [] } = useQuery(myInvoicesQuery(user?.id));
  const { data: projectInquiries = [] } = useQuery(myProjectRequestsQuery(user?.email));
  const { data: talentInquiries = [] } = useQuery(myTalentRequestsQuery(user?.email));
  const inquiries = [
    ...projectInquiries.map((i) => ({
      id: i.id,
      type: "Project" as const,
      summary: i.project_type,
      status: i.status,
      created_at: i.created_at,
    })),
    ...talentInquiries.map((i) => ({
      id: i.id,
      type: "Talent" as const,
      summary: i.required_role,
      status: i.status,
      created_at: i.created_at,
    })),
  ].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  const openRequests = requests.filter((r) => r.status !== "resolved").length;
  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const currency = invoices[0]?.currency ?? "EUR";

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title={`Welcome back${profile?.company_name ? `, ${profile.company_name}` : user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        intro="A single place for engagement status, deliverables, requests and invoices."
      />
      <Section>
        {!isLoading && !profile && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div>
              <h2 className="text-lg font-semibold">Finish setting up your company profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your company details so your delivery lead and engineers can prepare for the
                engagement.
              </p>
            </div>
            <Button asChild>
              <Link to="/portal-profile">Complete profile</Link>
            </Button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/portal-deliverables"
            className="rounded-xl border border-border bg-card p-7 card-hover"
          >
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Deliverables</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {deliverables.length} shared with you
            </p>
          </Link>
          <Link
            to="/portal-requests"
            className="rounded-xl border border-border bg-card p-7 card-hover"
          >
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Requests</h2>
            <p className="mt-2 text-sm text-muted-foreground">{openRequests} open</p>
          </Link>
          <Link
            to="/portal-invoices"
            className="rounded-xl border border-border bg-card p-7 card-hover"
          >
            <Receipt className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Invoices</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {outstanding > 0
                ? `${formatMoney(outstanding, currency)} outstanding`
                : "Nothing outstanding"}
            </p>
          </Link>
        </div>

        {inquiries.length > 0 && (
          <>
            <h2 className="mt-14 text-2xl font-bold">Your inquiries</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Requests you submitted before your account was set up.
            </p>
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              {inquiries.map((inquiry) => (
                <li
                  key={`${inquiry.type}-${inquiry.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquareText className="h-4 w-4 text-primary" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">
                        {inquiry.type === "Project" ? "Project inquiry" : "Talent request"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.summary} · {formatDate(inquiry.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{LEAD_STATUS_LABELS[inquiry.status]}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="mt-14 text-2xl font-bold">Projects</h2>
        {projectsLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border p-14 text-center">
            <Rocket className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold">No projects yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your delivery lead will publish your engagement here once kickoff is scheduled.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-border bg-card p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Badge variant="secondary">{PROJECT_STATUS_LABELS[project.status]}</Badge>
                </div>
                {project.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.summary}
                  </p>
                )}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="mt-2" />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      Next milestone
                    </dt>
                    <dd className="mt-1">{project.next_milestone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      Target date
                    </dt>
                    <dd className="mt-1">{formatDate(project.target_date)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/portal-requests">Raise a request</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/portal-profile">{profile ? "Edit company details" : "Company details"}</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
