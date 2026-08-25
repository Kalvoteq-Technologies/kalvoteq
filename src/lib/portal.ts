import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

/* ---------------------------------- types --------------------------------- */

export type ProjectStatus = "discovery" | "in_progress" | "on_hold" | "delivered";
export type RequestStatus = "open" | "in_progress" | "resolved";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Project {
  id: string;
  client_id: string;
  name: string;
  summary: string;
  status: ProjectStatus;
  progress: number;
  next_milestone: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  client_id: string;
  title: string;
  description: string;
  file_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface ClientRequest {
  id: string;
  client_id: string;
  project_id: string | null;
  subject: string;
  body: string;
  priority: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface RequestMessage {
  id: string;
  request_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  number: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  issued_on: string;
  due_on: string | null;
  created_at: string;
  updated_at: string;
}

/* --------------------------------- labels --------------------------------- */

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  discovery: "Discovery",
  in_progress: "In progress",
  on_hold: "On hold",
  delivered: "Delivered",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};

export const PRIORITIES = ["low", "normal", "high"] as const;

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: currency || "EUR" }).format(
    amountCents / 100,
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* --------------------------------- schemas -------------------------------- */

export const projectSchema = z.object({
  client_id: z.string().uuid("Choose a client"),
  name: z.string().trim().min(2, "Project name is required").max(140),
  summary: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => v ?? ""),
  status: z.enum(["discovery", "in_progress", "on_hold", "delivered"]),
  progress: z.coerce.number().int().min(0).max(100),
  next_milestone: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v ?? ""),
  start_date: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => v ?? ""),
  target_date: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => v ?? ""),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const deliverableSchema = z.object({
  project_id: z.string().uuid("Choose a project"),
  title: z.string().trim().min(2, "Title is required").max(160),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => v ?? ""),
});
export type DeliverableInput = z.infer<typeof deliverableSchema>;

export const requestSchema = z.object({
  subject: z.string().trim().min(3, "Add a short subject").max(160),
  body: z.string().trim().min(5, "Describe your request").max(4000),
  priority: z.enum(PRIORITIES),
  project_id: z
    .string()
    .optional()
    .transform((v) => v ?? ""),
});
export type RequestInput = z.infer<typeof requestSchema>;

export const invoiceSchema = z.object({
  client_id: z.string().uuid("Choose a client"),
  project_id: z
    .string()
    .optional()
    .transform((v) => v ?? ""),
  number: z.string().trim().min(1, "Invoice number is required").max(60),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v ?? ""),
  amount: z.coerce.number().min(0, "Amount must be positive").max(10_000_000),
  currency: z.string().trim().min(3).max(3),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
  issued_on: z.string().trim().min(1, "Issue date is required"),
  due_on: z
    .string()
    .trim()
    .optional()
    .transform((v) => v ?? ""),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

const nullify = (v: string) => (v.trim() === "" ? null : v.trim());

/* --------------------------------- queries -------------------------------- */

export const myProjectsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["projects", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const allProjectsQuery = () =>
  queryOptions({
    queryKey: ["projects", "all"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const myDeliverablesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["deliverables", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Deliverable[]> => {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("client_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Deliverable[];
    },
  });

export const allDeliverablesQuery = () =>
  queryOptions({
    queryKey: ["deliverables", "all"],
    queryFn: async (): Promise<Deliverable[]> => {
      const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Deliverable[];
    },
  });

export const myRequestsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["requests", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ClientRequest[]> => {
      const { data, error } = await supabase
        .from("client_requests")
        .select("*")
        .eq("client_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientRequest[];
    },
  });

export const allRequestsQuery = () =>
  queryOptions({
    queryKey: ["requests", "all"],
    queryFn: async (): Promise<ClientRequest[]> => {
      const { data, error } = await supabase
        .from("client_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientRequest[];
    },
  });

export const requestMessagesQuery = (requestId: string | undefined) =>
  queryOptions({
    queryKey: ["request-messages", requestId],
    enabled: Boolean(requestId),
    queryFn: async (): Promise<RequestMessage[]> => {
      const { data, error } = await supabase
        .from("request_messages")
        .select("*")
        .eq("request_id", requestId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RequestMessage[];
    },
  });

export const myInvoicesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["invoices", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", userId!)
        .order("issued_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });

export const allInvoicesQuery = () =>
  queryOptions({
    queryKey: ["invoices", "all"],
    queryFn: async (): Promise<Invoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("issued_on", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });

/* -------------------------------- mutations ------------------------------- */

export async function saveProject(input: ProjectInput, id?: string) {
  const row = {
    client_id: input.client_id,
    name: input.name,
    summary: input.summary,
    status: input.status,
    progress: input.progress,
    next_milestone: nullify(input.next_milestone),
    start_date: nullify(input.start_date),
    target_date: nullify(input.target_date),
  };
  const { error } = id
    ? await supabase.from("projects").update(row).eq("id", id)
    : await supabase.from("projects").insert(row);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

export const DELIVERABLES_BUCKET = "client-deliverables";
export const MAX_DELIVERABLE_BYTES = 25 * 1024 * 1024;

export async function createDeliverable(
  input: DeliverableInput,
  clientId: string,
  file: File | null,
) {
  let filePath: string | null = null;
  let fileName: string | null = null;
  let mimeType: string | null = null;
  let sizeBytes = 0;

  if (file) {
    if (file.size > MAX_DELIVERABLE_BYTES) throw new Error("File must be smaller than 25 MB");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    filePath = `${clientId}/${input.project_id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(DELIVERABLES_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (uploadError) throw uploadError;
    fileName = file.name;
    mimeType = file.type || "application/octet-stream";
    sizeBytes = file.size;
  }

  const { error } = await supabase.from("deliverables").insert({
    project_id: input.project_id,
    client_id: clientId,
    title: input.title,
    description: input.description,
    file_path: filePath,
    file_name: fileName,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  });
  if (error) {
    if (filePath) await supabase.storage.from(DELIVERABLES_BUCKET).remove([filePath]);
    throw error;
  }
}

export async function deleteDeliverable(deliverable: Deliverable) {
  const { error } = await supabase.from("deliverables").delete().eq("id", deliverable.id);
  if (error) throw error;
  if (deliverable.file_path) {
    await supabase.storage.from(DELIVERABLES_BUCKET).remove([deliverable.file_path]);
  }
}

/** Short-lived signed URL — the deliverables bucket is private. */
export async function getDeliverableUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DELIVERABLES_BUCKET)
    .createSignedUrl(path, 300);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not open that file");
  return data.signedUrl;
}

export async function createRequest(input: RequestInput, clientId: string) {
  const { data, error } = await supabase
    .from("client_requests")
    .insert({
      client_id: clientId,
      project_id: input.project_id ? input.project_id : null,
      subject: input.subject,
      body: input.body,
      priority: input.priority,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  const { error } = await supabase.from("client_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function postRequestMessage(requestId: string, authorId: string, body: string) {
  const { error } = await supabase.from("request_messages").insert({
    request_id: requestId,
    author_id: authorId,
    body,
  });
  if (error) throw error;
}

export async function saveInvoice(input: InvoiceInput, id?: string) {
  const row = {
    client_id: input.client_id,
    project_id: input.project_id ? input.project_id : null,
    number: input.number,
    description: input.description,
    amount_cents: Math.round(input.amount * 100),
    currency: input.currency.toUpperCase(),
    status: input.status,
    issued_on: input.issued_on,
    due_on: nullify(input.due_on),
  };
  const { error } = id
    ? await supabase.from("invoices").update(row).eq("id", id)
    : await supabase.from("invoices").insert(row);
  if (error) throw error;
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}
