import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GitBranch, PenLine, Terminal } from "lucide-react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { myDeveloperProfileQuery } from "@/lib/member-profiles";

export const Route = createFileRoute("/_authenticated/_developer/workspace")({
  head: () => ({
    meta: [
      { title: "Developer workspace — kalvoteq" },
      { name: "description", content: "Assignments, delivery notes, and engineering standards for the kalvoteq delivery team." },
      { property: "og:title", content: "Developer workspace — kalvoteq" },
      { property: "og:description", content: "Assignments and engineering standards." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperWorkspace,
});

const cards = [
  { icon: GitBranch, title: "Assignments", text: "Current engagement, squad, and the scope you own this sprint." },
  { icon: Terminal, title: "Engineering standards", text: "Architecture guardrails, review checklists, and the delivery playbook." },
  { icon: PenLine, title: "Write it up", text: "Turn a hard-won lesson into an insights article for the archive." },
];

function DeveloperWorkspace() {
  const { user, isAdmin } = useAuth();
  const { data: profile, isLoading } = useQuery(myDeveloperProfileQuery(user?.id));

  return (
    <>
      <PageHero
        eyebrow="Developer workspace"
        title={`Your delivery hub${user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        intro="Everything an engineer on a kalvoteq engagement needs in one place."
      />
      <Section>
        {!isLoading && !profile && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6">
            <div>
              <h2 className="text-lg font-semibold">Finish setting up your engineer profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your skills, availability, and links so delivery leads can staff you on the right engagements.
              </p>
            </div>
            <Button asChild>
              <Link to="/workspace-profile">Complete profile</Link>
            </Button>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-7 card-hover">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">Coming soon</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/workspace-profile">{profile ? "Edit engineer details" : "Engineer details"}</Link>
          </Button>
          {isAdmin && (
            <Button asChild>
              <Link to="/admin">Open editorial workspace</Link>
            </Button>
          )}
        </div>
      </Section>
    </>
  );
}
