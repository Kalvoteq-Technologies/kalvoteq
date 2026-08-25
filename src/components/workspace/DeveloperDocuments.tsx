import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Loader2, Lock, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
import {
  ACCEPTED_DOC_TYPES,
  DOC_TYPES,
  deleteDeveloperDocument,
  formatBytes,
  getDocumentUrl,
  myDocumentsQuery,
  uploadDeveloperDocument,
  type DeveloperDocument,
  type DocType,
} from "@/lib/developer-documents";

export function DeveloperDocuments({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<DocType>("cv");
  const [file, setFile] = useState<File | null>(null);

  const { data: documents = [], isLoading } = useQuery(myDocumentsQuery(userId));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["developer-documents"] });

  const upload = useMutation({
    mutationFn: async () => {
      if (!userId || !file) throw new Error("Choose a file first");
      await uploadDeveloperDocument({ userId, file, title, docType });
    },
    onSuccess: async () => {
      toast.success("Document uploaded");
      setFile(null);
      setTitle("");
      if (fileInput.current) fileInput.current.value = "";
      await invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not upload that file"),
  });

  const remove = useMutation({
    mutationFn: (doc: DeveloperDocument) => deleteDeveloperDocument(doc),
    onSuccess: async () => {
      toast.success("Document deleted");
      await invalidate();
    },
    onError: () => toast.error("Could not delete that document"),
  });

  const open = async (doc: DeveloperDocument) => {
    try {
      const url = await getDocumentUrl(doc.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open that document");
    }
  };

  return (
    <section
      className="rounded-xl border border-border bg-card p-7"
      aria-labelledby="documents-heading"
    >
      <h2 id="documents-heading" className="text-lg font-semibold">
        CV & portfolio documents
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Stored privately. Only you and kalvoteq admins can open these files.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          upload.mutate();
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="doc-file">File (PDF, Word, PNG or JPEG — max 10 MB)</Label>
          <Input
            id="doc-file"
            ref={fileInput}
            type="file"
            accept={ACCEPTED_DOC_TYPES.join(",")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-title">Label</Label>
          <Input
            id="doc-title"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior engineer CV 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doc-type">Kind</Label>
          <Select value={docType} onValueChange={(value) => setDocType(value as DocType)}>
            <SelectTrigger id="doc-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={!file || upload.isPending}>
            {upload.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Upload document
          </Button>
        </div>
      </form>

      <div className="mt-7 border-t border-border pt-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-3 py-3">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {DOC_TYPES.find((t) => t.value === doc.doc_type)?.label ?? doc.doc_type} ·{" "}
                    {doc.file_name} · {formatBytes(doc.size_bytes)}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void open(doc)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Open
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(doc)}
                  aria-label={`Delete ${doc.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
