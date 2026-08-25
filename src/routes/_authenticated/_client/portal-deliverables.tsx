import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, getDeliverableUrl, myDeliverablesQuery, myProjectsQuery } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/_client/portal-deliverables")({
  head: () => ({
    meta: [
      { title: "Deliverables — kalvoteq client portal" },
      {
        name: "description",
        content: "Reports, documents and artefacts shared with you by your kalvoteq delivery team.",
      },
      { property: "og:title", content: "Deliverables — kalvoteq client portal" },
      { property: "og:description", content: "Everything your delivery team has shared with you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeliverablesPage,
});

function formatSize(bytes: number) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function DeliverablesPage() {
  const { user } = useAuth();
  const { data: deliverables = [], isLoading } = useQuery(myDeliverablesQuery(user?.id));
  const { data: projects = [] } = useQuery(myProjectsQuery(user?.id));
  const [busy, setBusy] = useState<string | null>(null);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Project";

  async function open(path: string, id: string) {
    setBusy(id);
    try {
      const url = await getDeliverableUrl(path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open that file");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title="Deliverables"
        intro="Reports, architecture decisions and artefacts your delivery team has shared with you."
      >
        <Button asChild variant="outline">
          <Link to="/portal">Back to portal</Link>
        </Button>
      </PageHero>
      <Section>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading deliverables…</p>
        ) : deliverables.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <FileText className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold">Nothing shared yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New deliverables appear here as your engagement progresses.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {deliverables.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="min-w-0">
                  <p className="font-semibold">{d.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {projectName(d.project_id)} · {formatDate(d.created_at)}
                    {d.file_name ? ` · ${d.file_name} ${formatSize(d.size_bytes)}` : ""}
                  </p>
                  {d.description && (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{d.description}</p>
                  )}
                </div>
                {d.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy === d.id}
                    onClick={() => open(d.file_path!, d.id)}
                  >
                    <Download className="mr-1.5 h-4 w-4" />{" "}
                    {busy === d.id ? "Opening…" : "Download"}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
