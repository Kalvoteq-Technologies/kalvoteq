CREATE POLICY "Users manage own avatar files" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins read all avatar files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND private.has_role(auth.uid(), 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd='UPDATE'
  ) THEN
    CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;