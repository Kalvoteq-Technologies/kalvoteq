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
