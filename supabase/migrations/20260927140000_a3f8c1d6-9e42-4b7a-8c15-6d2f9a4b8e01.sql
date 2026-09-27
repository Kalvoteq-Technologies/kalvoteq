-- LinkedIn publishing: a single connected Company Page account (encrypted
-- tokens, service-role only — never exposed to any client, admin included)
-- and a queue of generated/published posts tied back to an existing article.

CREATE TABLE public.linkedin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_urn text NOT NULL,
  organization_name text NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text,
  access_token_expires_at timestamptz NOT NULL,
  refresh_token_expires_at timestamptz,
  connected_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- No RLS policies for authenticated/anon on purpose: tokens are read and
-- written exclusively via supabaseAdmin from server functions, after an
-- explicit admin-role check in application code. Nothing here should ever
-- be selectable by a browser session, including an admin's.
ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.linkedin_accounts TO service_role;
CREATE TRIGGER linkedin_accounts_set_updated_at BEFORE UPDATE ON public.linkedin_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.social_post_status AS ENUM ('draft', 'published', 'failed');

CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'linkedin',
  content text NOT NULL,
  status public.social_post_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  external_post_id text,
  error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX social_posts_post_id_idx ON public.social_posts (post_id);
GRANT ALL ON public.social_posts TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.social_posts TO authenticated;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view social posts" ON public.social_posts FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create social posts" ON public.social_posts FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update social posts" ON public.social_posts FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER social_posts_set_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
