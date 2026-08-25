import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";

import { PageHero, Section } from "@/components/site/Primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  formatDate,
  formatMoney,
  INVOICE_STATUS_LABELS,
  myInvoicesQuery,
  myProjectsQuery,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/_client/portal-invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — kalvoteq client portal" },
      {
        name: "description",
        content: "Review issued, paid and outstanding invoices for your kalvoteq engagement.",
      },
      { property: "og:title", content: "Invoices — kalvoteq client portal" },
      { property: "og:description", content: "Your engagement invoices in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const { user } = useAuth();
  const { data: invoices = [], isLoading } = useQuery(myInvoicesQuery(user?.id));
  const { data: projects = [] } = useQuery(myProjectsQuery(user?.id));

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const currency = invoices[0]?.currency ?? "EUR";

  return (
    <>
      <PageHero
        eyebrow="Client portal"
        title="Invoices"
        intro={
          outstanding > 0
            ? `${formatMoney(outstanding, currency)} currently outstanding.`
            : "Everything issued for your engagement."
        }
      >
        <Button asChild variant="outline">
          <Link to="/portal">Back to portal</Link>
        </Button>
      </PageHero>
      <Section>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading invoices…</p>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <Receipt className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold">No invoices yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-4 p-6"
              >
                <div>
                  <p className="font-semibold">
                    {invoice.number}
                    {invoice.project_id && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {projects.find((p) => p.id === invoice.project_id)?.name ?? ""}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Issued {formatDate(invoice.issued_on)} · Due {formatDate(invoice.due_on)}
                  </p>
                  {invoice.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{invoice.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold">
                    {formatMoney(invoice.amount_cents, invoice.currency)}
                  </span>
                  <Badge
                    variant={
                      invoice.status === "paid"
                        ? "secondary"
                        : invoice.status === "overdue"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
