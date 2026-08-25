import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Thread } from "@/routes/_authenticated/_client/portal-requests";
import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  allDeliverablesQuery,
  allInvoicesQuery,
  allProjectsQuery,
  allRequestsQuery,
  createDeliverable,
  deleteDeliverable,
  deleteInvoice,
  deleteProject,
  deliverableSchema,
  formatDate,
  formatMoney,
  invoiceSchema,
  INVOICE_STATUS_LABELS,
  projectSchema,
  PROJECT_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  saveInvoice,
  saveProject,
  setRequestStatus,
  type RequestStatus,
} from "@/lib/portal";
import { listTeam } from "@/lib/team.functions";

export const Route = createFileRoute("/_authenticated/_admin/admin/delivery")({
  head: () => ({
    meta: [
      { title: "Client delivery — kalvoteq admin" },
      { name: "description", content: "Manage client projects, deliverables, requests and invoices." },
      { property: "og:title", content: "Client delivery — kalvoteq admin" },
      { property: "og:description", content: "Admin control panel for client engagements." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeliveryAdmin,
});

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

function DeliveryAdmin() {
  return (
    <>
      <PageHero eyebrow="Admin" title="Client delivery" intro="Publish projects, share deliverables, answer requests and issue invoices.">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/admin/team">Team &amp; access</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/documents">Developer documents</Link></Button>
        </div>
      </PageHero>
      <Section>
        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="mt-8"><ProjectsTab /></TabsContent>
          <TabsContent value="deliverables" className="mt-8"><DeliverablesTab /></TabsContent>
          <TabsContent value="requests" className="mt-8"><RequestsTab /></TabsContent>
          <TabsContent value="invoices" className="mt-8"><InvoicesTab /></TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

/* -------------------------------- projects -------------------------------- */

function ProjectsTab() {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery(allProjectsQuery());
  const { data: clients = [] } = useClients();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    name: "",
    summary: "",
    status: "discovery",
    progress: "0",
    next_milestone: "",
    start_date: "",
    target_date: "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = projectSchema.parse(form);
      await saveProject(parsed);
    },
    onSuccess: () => {
      toast.success("Project saved");
      setOpen(false);
      setForm({ client_id: "", name: "", summary: "", status: "discovery", progress: "0", next_milestone: "", start_date: "", target_date: "" });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save project"),
  });

  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clientLabel = (id: string) => (() => { const c = clients.find((x) => x.id === id); return c?.displayName || c?.email || "Unknown client"; })();

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-1.5 h-4 w-4" /> New project</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.displayName ?? c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" className="mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="p-summary">Summary</Label>
              <Textarea id="p-summary" rows={3} className="mt-2" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-progress">Progress %</Label>
                <Input id="p-progress" type="number" min={0} max={100} className="mt-2" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="p-start">Start date</Label>
                <Input id="p-start" type="date" className="mt-2" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="p-target">Target date</Label>
                <Input id="p-target" type="date" className="mt-2" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="p-milestone">Next milestone</Label>
              <Input id="p-milestone" className="mt-2" value={form.next_milestone} onChange={(e) => setForm({ ...form, next_milestone: e.target.value })} />
            </div>
            <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Create project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading projects…</p>
      ) : projects.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {clientLabel(p.client_id)} · {PROJECT_STATUS_LABELS[p.status]} · {p.progress}% · target {formatDate(p.target_date)}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Delete project" onClick={() => remove.mutate(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------ deliverables ------------------------------ */

function DeliverablesTab() {
  const queryClient = useQueryClient();
  const { data: deliverables = [], isLoading } = useQuery(allDeliverablesQuery());
  const { data: projects = [] } = useQuery(allProjectsQuery());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ project_id: "", title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = deliverableSchema.parse(form);
      const project = projects.find((p) => p.id === parsed.project_id);
      if (!project) throw new Error("Choose a project");
      await createDeliverable(parsed, project.client_id, file);
    },
    onSuccess: () => {
      toast.success("Deliverable shared");
      setOpen(false);
      setForm({ project_id: "", title: "", description: "" });
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not share that deliverable"),
  });

  const remove = useMutation({
    mutationFn: deleteDeliverable,
    onSuccess: () => {
      toast.success("Deliverable removed");
      void queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-1.5 h-4 w-4" /> Share deliverable</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Share a deliverable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="d-title">Title</Label>
              <Input id="d-title" className="mt-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-desc">Description</Label>
              <Textarea id="d-desc" rows={3} className="mt-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="d-file">File (optional, max 25 MB)</Label>
              <Input id="d-file" type="file" className="mt-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Uploading…" : "Share"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading deliverables…</p>
      ) : deliverables.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nothing shared yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {deliverables.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {projects.find((p) => p.id === d.project_id)?.name ?? "Project"} · {formatDate(d.created_at)}
                  {d.file_name ? ` · ${d.file_name}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Delete deliverable" onClick={() => remove.mutate(d)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------- requests -------------------------------- */

function RequestsTab() {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery(allRequestsQuery());
  const [openId, setOpenId] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => setRequestStatus(id, status),
    onSuccess: () => {
      toast.success("Request updated");
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading requests…</p>;
  if (requests.length === 0) return <p className="text-sm text-muted-foreground">No client requests yet.</p>;

  return (
    <ul className="space-y-4">
      {requests.map((r) => (
        <li key={r.id} className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{r.subject}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {formatDate(r.created_at)} · {r.priority} priority
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={r.status === "resolved" ? "secondary" : "default"}>{REQUEST_STATUS_LABELS[r.status]}</Badge>
              <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id, status: v as RequestStatus })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{r.body}</p>
          <Button variant="ghost" size="sm" className="mt-3 px-0" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
            {openId === r.id ? "Hide conversation" : "Reply"}
          </Button>
          {openId === r.id && <Thread requestId={r.id} />}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- invoices -------------------------------- */

function InvoicesTab() {
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading } = useQuery(allInvoicesQuery());
  const { data: projects = [] } = useQuery(allProjectsQuery());
  const { data: clients = [] } = useClients();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    project_id: "none",
    number: "",
    description: "",
    amount: "",
    currency: "EUR",
    status: "draft",
    issued_on: new Date().toISOString().slice(0, 10),
    due_on: "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = invoiceSchema.parse({ ...form, project_id: form.project_id === "none" ? "" : form.project_id });
      await saveInvoice(parsed);
    },
    onSuccess: () => {
      toast.success("Invoice saved");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save invoice"),
  });

  const remove = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast.success("Invoice deleted");
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-1.5 h-4 w-4" /> New invoice</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.displayName ?? c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project (optional)</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects
                    .filter((p) => !form.client_id || p.client_id === form.client_id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="i-number">Number</Label>
                <Input id="i-number" className="mt-2" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="i-amount">Amount</Label>
                <Input id="i-amount" type="number" step="0.01" min="0" className="mt-2" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="i-currency">Currency</Label>
                <Input id="i-currency" maxLength={3} className="mt-2" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label htmlFor="i-issued">Issued on</Label>
                <Input id="i-issued" type="date" className="mt-2" value={form.issued_on} onChange={(e) => setForm({ ...form, issued_on: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="i-due">Due on</Label>
                <Input id="i-due" type="date" className="mt-2" value={form.due_on} onChange={(e) => setForm({ ...form, due_on: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="i-desc">Description</Label>
              <Textarea id="i-desc" rows={3} className="mt-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Create invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading invoices…</p>
      ) : invoices.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
          {invoices.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold">{i.number}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(() => { const c = clients.find((x) => x.id === i.client_id); return c?.displayName || c?.email || "Client"; })()} · issued {formatDate(i.issued_on)} · {INVOICE_STATUS_LABELS[i.status]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatMoney(i.amount_cents, i.currency)}</span>
                <Button variant="ghost" size="icon" aria-label="Delete invoice" onClick={() => remove.mutate(i.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
