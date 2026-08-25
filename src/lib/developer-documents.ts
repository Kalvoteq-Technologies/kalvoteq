import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const DEV_DOCS_BUCKET = "developer-documents";

export const DOC_TYPES = [
  { value: "cv", label: "CV / résumé" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
] as const;

export type DocType = (typeof DOC_TYPES)[number]["value"];

export const MAX_DOC_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

export interface DeveloperDocument {
  id: string;
  user_id: string;
  title: string;
  doc_type: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const myDocumentsQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["developer-documents", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<DeveloperDocument[]> => {
      const { data, error } = await supabase
        .from("developer_documents")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .returns<DeveloperDocument[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

/** Admin-only listing: RLS returns every developer's documents for admins. */
export const allDocumentsQuery = () =>
  queryOptions({
    queryKey: ["developer-documents", "all"],
    queryFn: async (): Promise<DeveloperDocument[]> => {
      const { data, error } = await supabase
        .from("developer_documents")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<DeveloperDocument[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
}

export async function uploadDeveloperDocument(input: {
  userId: string;
  file: File;
  title: string;
  docType: DocType;
}): Promise<DeveloperDocument> {
  const { userId, file, title, docType } = input;

  if (file.size > MAX_DOC_BYTES) {
    throw new Error("That file is larger than 10 MB");
  }
  if (file.type && !ACCEPTED_DOC_TYPES.includes(file.type)) {
    throw new Error("Upload a PDF, Word document, PNG, or JPEG");
  }

  const path = `${userId}/${Date.now()}-${sanitizeName(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(DEV_DOCS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("developer_documents")
    .insert({
      user_id: userId,
      title: title.trim() || file.name,
      doc_type: docType,
      file_path: path,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    })
    .select("*")
    .single<DeveloperDocument>();

  if (error) {
    await supabase.storage.from(DEV_DOCS_BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function deleteDeveloperDocument(doc: Pick<DeveloperDocument, "id" | "file_path">): Promise<void> {
  const { error } = await supabase.from("developer_documents").delete().eq("id", doc.id);
  if (error) throw error;
  await supabase.storage.from(DEV_DOCS_BUCKET).remove([doc.file_path]);
}

export async function renameDeveloperDocument(id: string, title: string): Promise<void> {
  const { error } = await supabase.from("developer_documents").update({ title: title.trim() }).eq("id", id);
  if (error) throw error;
}

/** Short-lived signed URL — the bucket is private, so this is the only way to open a file. */
export async function getDocumentUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(DEV_DOCS_BUCKET).createSignedUrl(filePath, 300);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not open that document");
  return data.signedUrl;
}
