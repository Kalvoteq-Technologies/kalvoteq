CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

CREATE TYPE public.post_status AS ENUM ('draft', 'published');

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image_url text,
  reading_time text,
  status public.post_status NOT NULL DEFAULT 'draft',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_status_published_at_idx ON public.posts (status, published_at DESC);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are viewable by everyone" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view their own posts" ON public.posts FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete their own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
GRANT SELECT ON public.post_tags TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_tags TO authenticated;
GRANT ALL ON public.post_tags TO service_role;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post tags are viewable by everyone" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Authors can attach tags to their posts" ON public.post_tags FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid()));
CREATE POLICY "Authors can remove tags from their posts" ON public.post_tags FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid()));

INSERT INTO public.categories (name, slug) VALUES
  ('Architecture', 'architecture'),
  ('AI', 'ai'),
  ('Cloud', 'cloud'),
  ('Teams', 'teams'),
  ('Design', 'design'),
  ('Compliance', 'compliance');

INSERT INTO public.tags (name, slug) VALUES
  ('Migration', 'migration'),
  ('LLM', 'llm'),
  ('FinOps', 'finops'),
  ('Hiring', 'hiring'),
  ('Design systems', 'design-systems'),
  ('EU', 'eu');

INSERT INTO public.posts (slug, title, excerpt, content, reading_time, status, published_at, category_id) VALUES
  ('strangler-pattern-in-practice', 'The strangler pattern in practice: migrating a core banking ledger', 'What incremental migration actually looks like when downtime is not an option.', '<p>What incremental migration actually looks like when downtime is not an option. This article walks through the routing layer, the dual-write window, and the cutover checks we use on regulated ledgers.</p>', '9 min', 'published', '2026-06-18T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'architecture')),
  ('evaluating-llm-features', 'Evaluating LLM features before you ship them', 'A practical evaluation harness that catches regressions your demo never will.', '<p>A practical evaluation harness that catches regressions your demo never will. We cover golden sets, scoring rubrics, and wiring evaluations into CI.</p>', '7 min', 'published', '2026-05-30T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'ai')),
  ('platform-cost-discipline', 'Cloud cost discipline without slowing delivery', 'The five FinOps controls that recovered 34% of a client''s monthly spend.', '<p>The five FinOps controls that recovered 34% of a client''s monthly spend, and how to apply them without adding friction to delivery teams.</p>', '6 min', 'published', '2026-05-02T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'cloud')),
  ('hiring-senior-engineers', 'How we screen for senior engineering judgement', 'Why live system design outperforms algorithm puzzles for consulting work.', '<p>Why live system design outperforms algorithm puzzles for consulting work, and the rubric our interviewers actually score against.</p>', '5 min', 'published', '2026-04-11T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'teams')),
  ('design-systems-that-survive', 'Design systems that survive delivery pressure', 'Tokens, governance, and the handful of rules that keep a system alive.', '<p>Tokens, governance, and the handful of rules that keep a system alive once the launch deadline arrives.</p>', '8 min', 'published', '2026-03-21T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'design')),
  ('eu-data-residency', 'EU data residency for AI workloads', 'Practical architecture for keeping regulated data inside the union.', '<p>Practical architecture for keeping regulated data inside the union, including model hosting, logging, and vendor selection.</p>', '6 min', 'published', '2026-02-14T09:00:00Z', (SELECT id FROM public.categories WHERE slug = 'compliance'));

INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'migration' WHERE p.slug = 'strangler-pattern-in-practice';
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'llm' WHERE p.slug = 'evaluating-llm-features';
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'finops' WHERE p.slug = 'platform-cost-discipline';
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'hiring' WHERE p.slug = 'hiring-senior-engineers';
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'design-systems' WHERE p.slug = 'design-systems-that-survive';
INSERT INTO public.post_tags (post_id, tag_id)
SELECT p.id, t.id FROM public.posts p JOIN public.tags t ON t.slug = 'eu' WHERE p.slug = 'eu-data-residency';