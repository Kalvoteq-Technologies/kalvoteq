REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP POLICY "Authenticated users can create categories" ON public.categories;
CREATE POLICY "Authenticated users can create categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);