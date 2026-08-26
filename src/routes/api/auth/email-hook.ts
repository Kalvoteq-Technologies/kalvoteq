import { createFileRoute } from "@tanstack/react-router";

// Supabase "Send Email" auth hook. Configured in Supabase Dashboard -> Auth ->
// Hooks, pointing at https://<domain>/api/auth/email-hook with a shared secret
// (SUPABASE_AUTH_HOOK_SECRET). Verifies the Standard Webhooks signature before
// dispatching to a branded template via Resend.

export const Route = createFileRoute("/api/auth/email-hook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["SUPABASE_AUTH_HOOK_SECRET"];
        if (!secret) {
          console.error("[auth-email-hook] Missing SUPABASE_AUTH_HOOK_SECRET");
          return Response.json(
            { error: { http_code: 500, message: "Hook not configured" } },
            { status: 500 },
          );
        }

        const payload = await request.text();
        const headers = Object.fromEntries(request.headers.entries());

        let verified: unknown;
        try {
          const { Webhook } = await import("standardwebhooks");
          const wh = new Webhook(secret);
          verified = wh.verify(payload, headers);
        } catch (err) {
          console.error("[auth-email-hook] Signature verification failed", err);
          return Response.json(
            { error: { http_code: 401, message: "Invalid signature" } },
            { status: 401 },
          );
        }

        const { user, email_data } = verified as {
          user: { email?: string; new_email?: string };
          email_data: {
            token: string;
            token_hash: string;
            token_new?: string;
            token_hash_new?: string;
            redirect_to: string;
            email_action_type: string;
            site_url: string;
          };
        };

        try {
          const { dispatchAuthEmail } = await import("@/lib/auth-email-hook.server");
          await dispatchAuthEmail(user, email_data);
        } catch (err) {
          console.error("[auth-email-hook] Failed to send email", err);
          return Response.json(
            { error: { http_code: 500, message: "Failed to send email" } },
            { status: 500 },
          );
        }

        return Response.json({});
      },
    },
  },
});
