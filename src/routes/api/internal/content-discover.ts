import { createFileRoute } from "@tanstack/react-router";

// Discovery ingestion trigger. Called on a schedule by a host crontab entry
// (see deploy/README.md), never by client code — guarded by a shared secret
// rather than user auth since there is no logged-in user in a cron context.

export const Route = createFileRoute("/api/internal/content-discover")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CONTENT_CRON_SECRET"];
        if (!secret) {
          console.error("[content-discover] Missing CONTENT_CRON_SECRET");
          return Response.json({ error: "Not configured" }, { status: 500 });
        }
        if (request.headers.get("x-cron-secret") !== secret) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const { runDiscovery } = await import("@/lib/content-intelligence/discovery.server");
          const result = await runDiscovery();
          return Response.json(result);
        } catch (err) {
          console.error("[content-discover] Discovery run failed", err);
          return Response.json({ error: "Discovery run failed" }, { status: 500 });
        }
      },
    },
  },
});
