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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
```

6. Start the stack:

```sh
docker compose up -d --build
```

Caddy automatically requests and renews HTTPS certificates when DNS resolves and ports 80/443 are reachable.

In Supabase Authentication settings, set the site URL to your domain and add the domain plus `/reset-password` to the redirect allow list. Configure Google OAuth in Supabase directly; the application no longer uses Lovable's OAuth service.

Keep `.env.production` out of Git and back up the Supabase project separately.
