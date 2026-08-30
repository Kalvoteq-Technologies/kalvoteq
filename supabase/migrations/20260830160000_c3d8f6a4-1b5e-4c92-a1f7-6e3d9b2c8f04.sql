-- Content Intelligence: source registry, discovery queue, and research jobs
-- feeding the existing posts table (AI-assisted articles reuse posts/categories/tags
-- rather than a parallel content model).

CREATE TYPE public.content_source_type AS ENUM ('rss', 'api', 'manual');

CREATE TABLE public.content_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type public.content_source_type NOT NULL DEFAULT 'rss',
  feed_url text NOT NULL,
  category text NOT NULL,
  trust_score smallint NOT NULL DEFAULT 70 CHECK (trust_score BETWEEN 0 AND 100),
  enabled boolean NOT NULL DEFAULT true,
  fetch_frequency_minutes int NOT NULL DEFAULT 240,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.content_sources TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.content_sources TO authenticated;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view content sources" ON public.content_sources FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins add content sources" ON public.content_sources FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update content sources" ON public.content_sources FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER content_sources_set_updated_at BEFORE UPDATE ON public.content_sources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.discovered_story_status AS ENUM ('new', 'researching', 'researched', 'drafted', 'rejected', 'archived');

CREATE TABLE public.discovered_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.content_sources(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  source_url text NOT NULL,
  author text,
  published_at timestamptz,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  summary text,
  category text,
  overall_score smallint NOT NULL,
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.discovered_story_status NOT NULL DEFAULT 'new',
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, external_id)
);
CREATE INDEX discovered_stories_status_score_idx ON public.discovered_stories (status, overall_score DESC);
CREATE INDEX discovered_stories_published_at_idx ON public.discovered_stories (published_at DESC);
GRANT ALL ON public.discovered_stories TO service_role;
GRANT SELECT, UPDATE ON public.discovered_stories TO authenticated;
ALTER TABLE public.discovered_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view discovered stories" ON public.discovered_stories FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update discovered stories" ON public.discovered_stories FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER discovered_stories_set_updated_at BEFORE UPDATE ON public.discovered_stories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.research_job_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE public.research_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.discovered_stories(id) ON DELETE CASCADE,
  status public.research_job_status NOT NULL DEFAULT 'pending',
  briefing jsonb,
  confidence_score smallint,
  error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX research_jobs_story_id_idx ON public.research_jobs (story_id);
GRANT ALL ON public.research_jobs TO service_role;
GRANT SELECT ON public.research_jobs TO authenticated;
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view research jobs" ON public.research_jobs FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE TYPE public.post_origin AS ENUM ('manual', 'ai');
CREATE TYPE public.post_verification_status AS ENUM ('verified', 'partially_verified', 'unverified');

ALTER TABLE public.posts
  ADD COLUMN origin public.post_origin NOT NULL DEFAULT 'manual',
  ADD COLUMN verification_status public.post_verification_status,
  ADD COLUMN research_job_id uuid REFERENCES public.research_jobs(id) ON DELETE SET NULL;
CREATE INDEX posts_origin_idx ON public.posts (origin);

-- Curated starting sources (RSS feeds admin can confirm, disable, or extend from /admin/content).
INSERT INTO public.content_sources (name, source_type, feed_url, category, trust_score) VALUES
  ('AWS News Blog', 'rss', 'https://aws.amazon.com/blogs/aws/feed/', 'Cloud & DevOps', 95),
  ('Kubernetes Blog', 'rss', 'https://kubernetes.io/feed.xml', 'Cloud & DevOps', 98),
  ('CNCF Blog', 'rss', 'https://www.cncf.io/blog/feed/', 'Cloud & DevOps', 92),
  ('GitHub Blog', 'rss', 'https://github.blog/feed/', 'Software Engineering', 92),
  ('Cloudflare Blog', 'rss', 'https://blog.cloudflare.com/rss/', 'Cybersecurity', 90),
  ('The New Stack', 'rss', 'https://thenewstack.io/feed/', 'Software Engineering', 82),
  ('InfoQ', 'rss', 'https://feed.infoq.com/', 'Software Engineering', 80),
  ('PostgreSQL News', 'rss', 'https://www.postgresql.org/news.rss', 'Software Engineering', 95);
