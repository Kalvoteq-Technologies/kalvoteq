CREATE TYPE public.project_status AS ENUM ('discovery','in_progress','on_hold','delivered');
CREATE TYPE public.request_status AS ENUM ('open','in_progress','resolved');
CREATE TYPE public.invoice_status AS ENUM ('draft','sent','paid','overdue');

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status public.project_status NOT NULL DEFAULT 'discovery',
  progress integer NOT NULL DEFAULT 0,
  next_milestone text,
  start_date date,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view their own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins view all projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX projects_client_id_idx ON public.projects (client_id);

CREATE TABLE public.deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_path text,
  file_name text,
  mime_type text,
  size_bytes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated;
GRANT ALL ON public.deliverables TO service_role;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view their own deliverables" ON public.deliverables FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Admins view all deliverables" ON public.deliverables FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert deliverables" ON public.deliverables FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update deliverables" ON public.deliverables FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete deliverables" ON public.deliverables FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER deliverables_set_updated_at BEFORE UPDATE ON public.deliverables FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX deliverables_project_id_idx ON public.deliverables (project_id);
CREATE INDEX deliverables_client_id_idx ON public.deliverables (client_id);

CREATE TABLE public.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal',
  status public.request_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_requests TO authenticated;
GRANT ALL ON public.client_requests TO service_role;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view their own requests" ON public.client_requests FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Clients create their own requests" ON public.client_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins view all requests" ON public.client_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update requests" ON public.client_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete requests" ON public.client_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER client_requests_set_updated_at BEFORE UPDATE ON public.client_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX client_requests_client_id_idx ON public.client_requests (client_id);

CREATE TABLE public.request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.client_requests(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.request_messages TO authenticated;
GRANT ALL ON public.request_messages TO service_role;
ALTER TABLE public.request_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view messages on their requests" ON public.request_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.client_requests r WHERE r.id = request_messages.request_id AND r.client_id = auth.uid()));
CREATE POLICY "Clients reply on their requests" ON public.request_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.client_requests r WHERE r.id = request_messages.request_id AND r.client_id = auth.uid()));
CREATE POLICY "Admins view all request messages" ON public.request_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins reply to any request" ON public.request_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete request messages" ON public.request_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX request_messages_request_id_idx ON public.request_messages (request_id);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  number text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issued_on date NOT NULL DEFAULT CURRENT_DATE,
  due_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view their own invoices" ON public.invoices FOR SELECT TO authenticated USING (auth.uid() = client_id AND status <> 'draft');
CREATE POLICY "Admins view all invoices" ON public.invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update invoices" ON public.invoices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete invoices" ON public.invoices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER invoices_set_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX invoices_client_id_idx ON public.invoices (client_id);