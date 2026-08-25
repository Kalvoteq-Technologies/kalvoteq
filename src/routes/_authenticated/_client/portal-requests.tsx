import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/hooks/useAuth";
import {
  createRequest,
  formatDate,
  myProjectsQuery,
  myRequestsQuery,
  postRequestMessage,
  requestMessagesQuery,
  requestSchema,
  REQUEST_STATUS_LABELS,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/_client/portal-requests")({
  head: () => ({
    meta: [
      { title: "Requests — kalvoteq client portal" },
      {
        name: "description",
        content: "Raise a request and message the kalvoteq engineers working on your product.",
      },
      { property: "og:title", content: "Requests — kalvoteq client portal" },
      { property: "og:description", content: "Raise and track support requests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery(myRequestsQuery(user?.id));
  const { data: projects = [] } = useQuery(myProjectsQuery(user?.id));
  const [openId, setOpenId] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [projectId, setProjectId] = useState("none");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = requestSchema.safeParse({
        subject,
        body,
        priority,
        project_id: projectId === "none" ? "" : projectId,
      });
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
        setErrors(fieldErrors);
        throw new Error("invalid");
      }
      setErrors({});
      return createRequest(parsed.data, user!.id);
    },
    onSuccess: () => {
      toast.success("Request sent — we'll be in touch shortly");
      setSubject("");
      setBody("");
      setPriority("normal");
      setProjectId("none");
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (error: Error) => {
      if (error.message !== "invalid") toast.error(error.message || "Could not send that request");
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title="Requests"
        intro="Ask a question, flag an issue, or request a change. Your delivery team replies in the thread."
      >
        <Button asChild variant="outline">
          <Link to="/portal">Back to portal</Link>
        </Button>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <form
            className="rounded-xl border border-border bg-card p-7"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <h2 className="text-lg font-semibold">New request</h2>
            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={160}
                  className="mt-2"
                />
                {errors["subject"] && (
                  <p className="mt-1 text-sm text-destructive">{errors["subject"]}</p>
                )}
              </div>
              <div>
                <Label htmlFor="body">Details</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={4000}
                  className="mt-2"
                />
                {errors["body"] && (
                  <p className="mt-1 text-sm text-destructive">{errors["body"]}</p>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="General" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={submit.isPending}>
                {submit.isPending ? "Sending…" : "Send request"}
              </Button>
            </div>
          </form>

          <div>
            <h2 className="text-lg font-semibold">Your requests</h2>
            {isLoading ? (
              <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
            ) : requests.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border p-14 text-center">
                <LifeBuoy className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="mt-4 font-semibold">No requests yet</p>
              </div>
            ) : (
              <ul className="mt-6 space-y-4">
                {requests.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{r.subject}</p>
                        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                          {formatDate(r.created_at)} · {r.priority} priority
                        </p>
                      </div>
                      <Badge variant={r.status === "resolved" ? "secondary" : "default"}>
                        {REQUEST_STATUS_LABELS[r.status]}
                      </Badge>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                      {r.body}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 px-0"
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    >
                      {openId === r.id ? "Hide conversation" : "View conversation"}
                    </Button>
                    {openId === r.id && <Thread requestId={r.id} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

export function Thread({ requestId }: { requestId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useQuery(requestMessagesQuery(requestId));
  const [text, setText] = useState("");

  const send = useMutation({
    mutationFn: async () => {
      const value = text.trim();
      if (value.length < 1) throw new Error("Write a message first");
      if (value.length > 4000) throw new Error("Message is too long");
      return postRequestMessage(requestId, user!.id, value);
    },
    onSuccess: () => {
      setText("");
      void queryClient.invalidateQueries({ queryKey: ["request-messages", requestId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mt-4 border-t border-border pt-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No replies yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg p-3 text-sm ${m.author_id === user?.id ? "bg-primary/10" : "bg-surface"}`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {m.author_id === user?.id ? "You" : "kalvoteq"} · {formatDate(m.created_at)}
              </p>
              <p className="mt-1 whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-2">
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a reply…"
        />
        <Button
          size="icon"
          disabled={send.isPending}
          onClick={() => send.mutate()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
