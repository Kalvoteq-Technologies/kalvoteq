CREATE TABLE public.developer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'cv',
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  size_bytes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_documents TO authenticated;
GRANT ALL ON public.developer_documents TO service_role;

ALTER TABLE public.developer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view their own documents"
  ON public.developer_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all developer documents"
  ON public.developer_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can add their own documents"
  ON public.developer_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Developers can update their own documents"
  ON public.developer_documents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Developers can delete their own documents"
  ON public.developer_documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete developer documents"
  ON public.developer_documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER developer_documents_set_updated_at
  BEFORE UPDATE ON public.developer_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX developer_documents_user_id_idx ON public.developer_documents(user_id);

-- Storage policies: files are stored as <user_id>/<filename>
CREATE POLICY "Developers can read their own document files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'developer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can read all developer document files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'developer-documents' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Developers can upload their own document files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'developer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Developers can update their own document files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'developer-documents' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'developer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Developers can delete their own document files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'developer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete developer document files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'developer-documents' AND public.has_role(auth.uid(), 'admin'::app_role));