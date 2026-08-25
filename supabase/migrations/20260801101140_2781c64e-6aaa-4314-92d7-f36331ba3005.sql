CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND owner = auth.uid());
CREATE POLICY "Users can update their own blog images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND owner = auth.uid());
CREATE POLICY "Users can delete their own blog images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND owner = auth.uid());
CREATE POLICY "Authenticated users can read blog images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'blog-images');