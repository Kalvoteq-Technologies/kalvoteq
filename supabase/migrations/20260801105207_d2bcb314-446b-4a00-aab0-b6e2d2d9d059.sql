ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS logo_path text;

CREATE POLICY "Clients manage own logo uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'client-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Clients update own logo uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'client-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'client-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Clients delete own logo uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'client-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Clients view own logo uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'client-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins view all client logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete client logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Developers view client logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'developer'));