import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, Lock } from "lucide-react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import {
  DOC_TYPES,
  allDocumentsQuery,
  formatBytes,
  getDocumentUrl,
  type DeveloperDocument,
} from "@/lib/developer-documents";

export const Route = createFileRoute("/_authenticated/_admin/admin/documents")({
  head: () => ({
    meta: [
      { title: "Developer documents — kalvoteq Admin" },
      {
        name: "description",
        content: "Review CVs and portfolio documents uploaded by kalvoteq engineers.",
      },
      { property: "og:title", content: "Developer documents — kalvoteq Admin" },
      { property: "og:description", content: "Private CV and portfolio library for admins." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: documents = [], isLoading, error } = useQuery(allDocumentsQuery());

  const open = async (doc: DeveloperDocument) => {
    try {
      const url = await getDocumentUrl(doc.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not open that document");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Developer documents"
        intro="CVs and portfolio files uploaded by engineers. Files are stored privately and links expire after five minutes."
      >
        <Button asChild variant="outline">
          <Link to="/admin/team">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Team & access
          </Link>
        </Button>
      </PageHero>

      <Section>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Visible to admins and the owning engineer only.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading documents…</p>
        ) : error ? (
          <p className="mt-8 text-sm text-destructive">Could not load documents.</p>
        ) : documents.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No engineer has uploaded a document yet.</p>
        ) : (
          <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-3 p-5">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {DOC_TYPES.find((t) => t.value === doc.doc_type)?.label ?? doc.doc_type} · {doc.file_name} ·{" "}
                    {formatBytes(doc.size_bytes)} · uploaded {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void open(doc)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Open
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
