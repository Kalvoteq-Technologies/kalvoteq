-- Additional curated sources, verified live before adding (each returned a real
-- XML feed at insert time — see conversation for verification method).
INSERT INTO public.content_sources (name, source_type, feed_url, category, trust_score) VALUES
  ('Martin Fowler''s Blog', 'rss', 'https://martinfowler.com/feed.atom', 'Software Engineering', 96),
  ('Krebs on Security', 'rss', 'https://krebsonsecurity.com/feed/', 'Cybersecurity', 95),
  ('The Hacker News', 'rss', 'https://feeds.feedburner.com/TheHackersNews', 'Cybersecurity', 82),
  ('Stack Overflow Blog', 'rss', 'https://stackoverflow.blog/feed/', 'Software Engineering', 85),
  ('Vercel Blog', 'rss', 'https://vercel.com/atom', 'Software Engineering', 82),
  ('Stripe Blog', 'rss', 'https://stripe.com/blog/feed.rss', 'Software Engineering', 78),
  ('Google Cloud Blog', 'rss', 'https://cloudblog.withgoogle.com/rss/', 'Cloud & DevOps', 92),
  ('Docker Blog', 'rss', 'https://www.docker.com/blog/feed/', 'Cloud & DevOps', 88),
  ('Hugging Face Blog', 'rss', 'https://huggingface.co/blog/feed.xml', 'Artificial Intelligence', 88),
  ('Google DeepMind Blog', 'rss', 'https://deepmind.google/blog/feed/basic/', 'Artificial Intelligence', 98);
