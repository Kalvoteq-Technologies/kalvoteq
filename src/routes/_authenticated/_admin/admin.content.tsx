import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Inbox, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiPostsQuery, type PostRow } from "@/lib/blog";
import {
  researchJobQuery,
  researchJobsByStoryQuery,
  type ResearchJobSummary,
} from "@/lib/content-intelligence/research-jobs";
import {
  addSource,
  listSources,
  toggleSource,
  type ContentSource,
} from "@/lib/content-intelligence/sources.functions";
import {
  generateDraft,
  listDiscoveredStories,
  rejectStory,
  researchStory,
  type DiscoveredStory,
} from "@/lib/content-intelligence/stories.functions";

export const Route = createFileRoute("/_authenticated/_admin/admin/content")({
  head: () => ({
    meta: [
      { title: "Content Intelligence — kalvoteq Admin" },
      {
        name: "description",
        content:
          "Discovered technology developments, research briefings, and AI-assisted drafts awaiting review.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContentIntelligencePage,
});

const STATUS_LABELS: Record<DiscoveredStory["status"], string> = {
  new: "New",
  researching: "Researching…",
  researched: "Researched",
  drafted: "Drafted",
  rejected: "Rejected",
  archived: "Archived",
};

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function useDiscoveredStories() {
  const fetchStories = useServerFn(listDiscoveredStories);
  return useQuery({
    queryKey: ["content-intelligence", "stories"],
    queryFn: () => fetchStories(),
  });
}

function useSources() {
  const fetchSources = useServerFn(listSources);
  return useQuery({
    queryKey: ["content-intelligence", "sources"],
    queryFn: () => fetchSources(),
  });
}

function ContentIntelligencePage() {
  const [tab, setTab] = useState<"discovered" | "drafts" | "sources">("discovered");
  const { data: stories = [] } = useDiscoveredStories();
  const { data: aiPosts = [] } = useQuery(aiPostsQuery());
  const { data: jobsByStory = {} } = useQuery(researchJobsByStoryQuery());

  const discoveredToday = stories.filter(
    (s) => new Date(s.discovered_at).getTime() >= startOfToday(),
  ).length;
  const awaitingReview = aiPosts.filter((p) => p.status === "draft").length;
  const publishedThisMonth = aiPosts.filter(
    (p) => p.status === "published" && p.published_at && isThisMonth(p.published_at),
  ).length;
  const confidenceScores = Object.values(jobsByStory)
    .filter((j) => j.status === "completed" && j.confidence_score != null)
    .map((j) => j.confidence_score as number);
  const avgConfidence =
    confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : null;

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Content Intelligence"
        intro="Discovered developments, research briefings, and AI-assisted drafts — nothing publishes without review."
      >
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to articles
          </Link>
        </Button>
      </PageHero>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Discovered today" value={String(discoveredToday)} />
          <StatCard label="Awaiting review" value={String(awaitingReview)} />
          <StatCard label="Published this month" value={String(publishedThisMonth)} />
          <StatCard
            label="Avg. verification"
            value={avgConfidence != null ? `${avgConfidence}%` : "—"}
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-10">
          <TabsList>
            <TabsTrigger value="discovered">Discovered ({stories.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({aiPosts.length})</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-8">
          {tab === "discovered" && <DiscoveredTab stories={stories} jobsByStory={jobsByStory} />}
          {tab === "drafts" && <DraftsTab posts={aiPosts} />}
          {tab === "sources" && <SourcesTab />}
        </div>
      </Section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
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

/* ------------------------------- discovered ------------------------------- */

function DiscoveredTab({
  stories,
  jobsByStory,
}: {
  stories: DiscoveredStory[];
  jobsByStory: Record<string, ResearchJobSummary>;
}) {
  const queryClient = useQueryClient();
  const doReject = useServerFn(rejectStory);
  const doResearch = useServerFn(researchStory);
  const doGenerate = useServerFn(generateDraft);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["content-intelligence"] });
    void queryClient.invalidateQueries({ queryKey: ["research-jobs"] });
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const reject = useMutation({
    mutationFn: (storyId: string) => doReject({ data: { storyId } }),
    onSuccess: invalidate,
    onError: () => toast.error("Could not reject that story"),
  });

  const research = useMutation({
    mutationFn: (storyId: string) => doResearch({ data: { storyId } }),
    onSuccess: () => {
      invalidate();
      toast.success("Research briefing ready");
    },
    onError: (e: Error) => toast.error(e.message || "Research failed"),
  });

  const generate = useMutation({
    mutationFn: (researchJobId: string) => doGenerate({ data: { researchJobId } }),
    onSuccess: (result) => {
      invalidate();
      toast.success("Draft generated");
      navigateToPost(result.postId);
    },
    onError: (e: Error) => toast.error(e.message || "Draft generation failed"),
  });

  function navigateToPost(postId: string) {
    window.location.assign(`/admin/${postId}`);
  }

  function handleGenerate(job: ResearchJobSummary) {
    if (job.briefing?.recommended_content_type === "no_content") {
      const proceed = window.confirm(
        `Claude recommended NOT writing this up: "${job.briefing.recommendation_reason}"\n\nGenerate a draft anyway?`,
      );
      if (!proceed) return;
    }
    generate.mutate(job.id);
  }

  const visible = stories.filter((s) => s.status !== "rejected" && s.status !== "archived");

  if (visible.length === 0) return <EmptyState label="discovered stories" />;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {visible.map((story) => {
        const job = jobsByStory[story.id];
        return (
          <StoryRow
            key={story.id}
            story={story}
            job={job}
            onReject={() => reject.mutate(story.id)}
            onResearch={() => research.mutate(story.id)}
            onGenerate={() => job && handleGenerate(job)}
            rejectPending={reject.isPending && reject.variables === story.id}
            researchPending={research.isPending && research.variables === story.id}
            generatePending={generate.isPending && generate.variables === job?.id}
          />
        );
      })}
    </ul>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {label} <b className="text-foreground">{value}</b>
    </span>
  );
}

function StoryRow({
  story,
  job,
  onReject,
  onResearch,
  onGenerate,
  rejectPending,
  researchPending,
  generatePending,
}: {
  story: DiscoveredStory;
  job: ResearchJobSummary | undefined;
  onReject: () => void;
  onResearch: () => void;
  onGenerate: () => void;
  rejectPending: boolean;
  researchPending: boolean;
  generatePending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: fullJob } = useQuery({
    ...researchJobQuery(job?.id),
    enabled: expanded && Boolean(job?.id),
  });

  return (
    <li className="flex flex-wrap items-start justify-between gap-4 p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={story.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold hover:text-primary"
          >
            {story.title}
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
          </a>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {story.content_sources?.name ?? "Unknown source"}
          {story.published_at && ` · ${new Date(story.published_at).toLocaleDateString("en-GB")}`}
          {story.category && ` · ${story.category}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <ScoreChip label="Overall" value={story.overall_score} />
          <ScoreChip label="Topic" value={story.score_breakdown.topic} />
          <ScoreChip label="Trust" value={story.score_breakdown.trust} />
          <ScoreChip label="Fresh" value={story.score_breakdown.freshness} />
        </div>

        {expanded && fullJob?.briefing && (
          <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <p>{fullJob.briefing.what_happened}</p>
            {fullJob.briefing.kalvoteq_angle && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Kalvoteq angle: </span>
                {fullJob.briefing.kalvoteq_angle}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Suggested: {fullJob.briefing.recommended_content_type.replace(/_/g, " ")} —{" "}
              {fullJob.briefing.recommendation_reason}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Badge variant={story.status === "drafted" ? "default" : "secondary"}>
          {STATUS_LABELS[story.status]}
        </Badge>
        <div className="flex flex-wrap justify-end gap-2">
          {story.status === "new" && (
            <>
              <Button size="sm" variant="outline" disabled={rejectPending} onClick={onReject}>
                Reject
              </Button>
              <Button size="sm" disabled={researchPending} onClick={onResearch}>
                {researchPending ? "Researching…" : "Research"}
              </Button>
            </>
          )}
          {story.status === "researched" && job && (
            <>
              {job.briefing?.recommended_content_type === "no_content" && (
                <span className="text-xs font-medium text-destructive">Claude: skip this one</span>
              )}
              <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
                {expanded ? "Hide briefing" : "View briefing"}
              </Button>
              <Button size="sm" disabled={generatePending} onClick={onGenerate}>
                {generatePending ? "Generating…" : "Generate draft"}
              </Button>
            </>
          )}
          {story.status === "drafted" && story.post_id && (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/$id" params={{ id: story.post_id }}>
                View draft
              </Link>
            </Button>
          )}
          {story.status === "researching" && (
            <span className="text-xs text-muted-foreground">Working…</span>
          )}
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------- drafts --------------------------------- */

function DraftsTab({ posts }: { posts: PostRow[] }) {
  if (posts.length === 0) return <EmptyState label="AI-assisted drafts" />;

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {posts.map((post) => (
        <li key={post.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0 flex-1">
            <Link
              to="/admin/$id"
              params={{ id: post.id }}
              className="font-semibold hover:text-primary"
            >
              {post.title || "Untitled"}
            </Link>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {post.excerpt || "No excerpt yet"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={post.status === "published" ? "default" : "secondary"}>
                {post.status}
              </Badge>
              {post.verification_status && (
                <Badge
                  variant={post.verification_status === "unverified" ? "destructive" : "outline"}
                >
                  {post.verification_status.replace("_", " ")}
                </Badge>
              )}
              <span>Updated {new Date(post.updated_at).toLocaleDateString("en-GB")}</span>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/$id" params={{ id: post.id }}>
              Review
            </Link>
          </Button>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- sources ---------------------------------- */

const addSourceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  feedUrl: z.string().trim().url(),
  category: z.string().trim().min(2).max(80),
  trustScore: z.number().int().min(0).max(100),
});

function SourcesTab() {
  const queryClient = useQueryClient();
  const { data: sources = [], isLoading } = useSources();
  const doAdd = useServerFn(addSource);
  const doToggle = useServerFn(toggleSource);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", feedUrl: "", category: "", trustScore: "70" });

  const add = useMutation({
    mutationFn: async () => {
      const parsed = addSourceSchema.parse({ ...form, trustScore: Number(form.trustScore) });
      await doAdd({ data: parsed });
    },
    onSuccess: () => {
      toast.success("Source added");
      setOpen(false);
      setForm({ name: "", feedUrl: "", category: "", trustScore: "70" });
      void queryClient.invalidateQueries({ queryKey: ["content-intelligence", "sources"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not add that source"),
  });

  const toggle = useMutation({
    mutationFn: (vars: { id: string; enabled: boolean }) => doToggle({ data: vars }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["content-intelligence", "sources"] });
    },
    onError: () => toast.error("Could not update that source"),
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Add source
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add an RSS source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="s-name">Name</Label>
              <Input
                id="s-name"
                className="mt-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="s-url">Feed URL</Label>
              <Input
                id="s-url"
                className="mt-2"
                placeholder="https://example.com/feed.xml"
                value={form.feedUrl}
                onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="s-category">Category</Label>
              <Input
                id="s-category"
                className="mt-2"
                placeholder="Cloud & DevOps"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="s-trust">Trust score (0-100)</Label>
              <Input
                id="s-trust"
                type="number"
                min={0}
                max={100}
                className="mt-2"
                value={form.trustScore}
                onChange={(e) => setForm({ ...form, trustScore: e.target.value })}
              />
            </div>
            <Button className="w-full" disabled={add.isPending} onClick={() => add.mutate()}>
              {add.isPending ? "Adding…" : "Add source"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading sources…</p>
      ) : sources.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No sources configured yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {sources.map((s: ContentSource) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">{s.feed_url}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.category} · trust {s.trust_score}
                  {s.last_error && (
                    <span className="text-destructive"> · last check failed: {s.last_error}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {s.enabled ? "Enabled" : "Disabled"}
                </span>
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(checked) => toggle.mutate({ id: s.id, enabled: checked })}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
