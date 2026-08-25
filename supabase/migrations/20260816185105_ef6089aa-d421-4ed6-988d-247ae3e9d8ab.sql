DROP POLICY IF EXISTS "Authenticated users can create categories" ON public.categories;
CREATE POLICY "Admins can create categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Admins can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR private.has_role(auth.uid(), 'admin'));