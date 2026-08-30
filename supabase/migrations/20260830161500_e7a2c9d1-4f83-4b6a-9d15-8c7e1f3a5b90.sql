-- AI-drafted posts are authored by whichever admin triggered generation, but the
-- editorial queue is shared — any admin needs to see and edit them, not just the
-- one who clicked "Generate". Manually-written posts keep their existing
-- author-only visibility; this only widens access for origin = 'ai' rows.

CREATE POLICY "Admins view ai-drafted posts" ON public.posts FOR SELECT TO authenticated
  USING (origin = 'ai' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update ai-drafted posts" ON public.posts FOR UPDATE TO authenticated
  USING (origin = 'ai' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (origin = 'ai' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete ai-drafted posts" ON public.posts FOR DELETE TO authenticated
  USING (origin = 'ai' AND private.has_role(auth.uid(), 'admin'));
