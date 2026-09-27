import { createFileRoute } from "@tanstack/react-router";

// LinkedIn OAuth redirect target. A plain browser redirect carries no
// Authorization header, so the admin check happened once already — when
// /admin/content asked getLinkedInAuthUrl for the authorization URL and
// signed the `state` param with that admin's user id. Here we only verify
// that signature, never re-check a session directly.

export const Route = createFileRoute("/api/auth/linkedin/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const oauthError = url.searchParams.get("error");

        const backTo = (status: "connected" | "error", message?: string) => {
          const target = new URL("/admin/content", url.origin);
          target.searchParams.set("linkedin", status);
          if (message) target.searchParams.set("linkedin_message", message);
          return Response.redirect(target.toString(), 302);
        };

        if (oauthError) return backTo("error", oauthError);
        if (!code || !state) return backTo("error", "missing_code_or_state");

        const { verifyOAuthState } = await import("@/lib/linkedin/oauth-state.server");
        const verified = verifyOAuthState(state);
        if (!verified) return backTo("error", "invalid_or_expired_state");

        try {
          const { exchangeCodeForToken, fetchAdminOrganization } =
            await import("@/lib/linkedin/client.server");
          const token = await exchangeCodeForToken(code);
          const org = await fetchAdminOrganization(token.access_token);

          const { saveConnectedAccount } = await import("@/lib/linkedin/account.server");
          await saveConnectedAccount({
            organizationUrn: org.urn,
            organizationName: org.name,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresInSeconds: token.expires_in,
            refreshTokenExpiresInSeconds: token.refresh_token_expires_in,
            connectedBy: verified.userId,
          });

          return backTo("connected");
        } catch (err) {
          console.error("[linkedin] OAuth callback failed", err);
          return backTo("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});
