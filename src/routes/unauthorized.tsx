import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { z } from "zod";

import { Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";

const searchSchema = z.object({ required: z.enum(["admin", "client", "developer"]).optional() });

export const Route = createFileRoute("/unauthorized")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Access required — kalvoteq" },
      { name: "description", content: "This area of the kalvoteq platform needs an access level your account does not have yet." },
      { property: "og:title", content: "Access required — kalvoteq" },
      { property: "og:description", content: "Request access to this area of the kalvoteq platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { required } = Route.useSearch();
  const label = required ? ROLE_LABELS[required as AppRole] : null;

  return (
    <Section>
      <div className="mx-auto max-w-xl text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Access required</h1>
        <p className="mt-4 text-muted-foreground">
          {label
            ? `This area needs ${label} access. Ask a kalvoteq admin to grant it to your account.`
            : "Your account does not have access to this area yet. Ask a kalvoteq admin to grant it."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/contact">Request access</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
