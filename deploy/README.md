# Hetzner deployment

This setup runs the TanStack Start Node server in Docker and terminates HTTPS with Caddy.

1. Create a Hetzner Cloud server running Ubuntu 24.04.
2. Point an `A` record for your domain at the server IPv4 address.
3. Install Docker Engine and the Compose plugin.
4. Clone this repository to the server.
5. Create `.env.production` in the project root:

```env
APP_DOMAIN=example.com
ROOT_DOMAIN=example.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
```

`SUPABASE_PUBLISHABLE_KEY` (no `VITE_` prefix) is required server-side by the authenticated
server-function middleware (`src/integrations/supabase/auth-middleware.ts`) — it is not a
duplicate of `VITE_SUPABASE_PUBLISHABLE_KEY`, which only reaches the browser bundle. Omitting it
makes every admin-only server action (e.g. Team & access) fail with "Missing Supabase environment
variable(s): SUPABASE_PUBLISHABLE_KEY" while the rest of the site works normally.

6. Start the stack:

```sh
docker compose up -d --build
```

Caddy automatically requests and renews HTTPS certificates when DNS resolves and ports 80/443 are reachable.

In Supabase Authentication settings, set the site URL to your domain and add the domain plus `/reset-password` to the redirect allow list. Configure Google OAuth in Supabase directly; the application no longer uses Lovable's OAuth service.

Keep `.env.production` out of Git and back up the Supabase project separately.

## Content Intelligence discovery schedule

Add to `.env.production`:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
CONTENT_CRON_SECRET=a-long-random-secret
```

The discovery job runs on the host, not inside the container — no new Docker service is needed.
Add a crontab entry on the Hetzner host to check enabled RSS sources every few hours:

```sh
crontab -e
```

```cron
0 */4 * * * curl -fsS -X POST https://APP_DOMAIN/api/internal/content-discover -H "x-cron-secret: a-long-random-secret" >> /var/log/kalvoteq-content-discover.log 2>&1
```

Use the `APP_DOMAIN` value from `.env.production` (e.g. `www.kalvoteq.com`), not `ROOT_DOMAIN` — the
Caddyfile 301-redirects the root domain to it, and curl does not follow redirects on a POST by
default, so the cron job would silently no-op against the apex domain.

Research and draft generation are triggered manually from `/admin/content` and are not scheduled —
publishing stays behind human review by default.

## LinkedIn publishing

Add to `.env.production`:

```env
LINKEDIN_CLIENT_ID=your-linkedin-app-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-app-client-secret
LINKEDIN_REDIRECT_URI=https://APP_DOMAIN/api/auth/linkedin/callback
LINKEDIN_TOKEN_ENCRYPTION_KEY=32-random-bytes-base64-encoded
```

Generate `LINKEDIN_TOKEN_ENCRYPTION_KEY` once with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Getting the LinkedIn app credentials is a manual, LinkedIn-side process (not something this app can
automate):

1. At developer.linkedin.com, create a developer app associated with the Kalvoteq Company Page (you
   must be an admin of that page).
2. Request access to the **Community Management API** product. LinkedIn's Development tier (the
   default, no review needed beyond the initial approval) allows 500 API calls/day for the app and
   100/day per admin — comfortably enough for a few posts a week. The heavier "Standard tier"
   screencast review is not needed at this volume.
3. The approval form requires a **business email on your own domain** (a personal address is
   rejected) plus your legal company name, registered address, website, and privacy policy URL.
4. Once approved, copy the app's Client ID and Client Secret into `.env.production`, and register
   `LINKEDIN_REDIRECT_URI` as an authorized redirect URL on the app.

After that, connecting is done from the app itself: `/admin/content` → LinkedIn tab → Connect
LinkedIn, which runs the OAuth flow and stores the tokens (AES-256-GCM encrypted) in the
`linkedin_accounts` table. Tokens are never exposed to any client, including the admin UI — only a
connected/disconnected status and the organization name are ever returned to the browser.

Access tokens expire after 60 days and are refreshed automatically on next use; refresh tokens last
365 days. If the refresh token itself expires, reconnecting from the LinkedIn tab is the fix.
