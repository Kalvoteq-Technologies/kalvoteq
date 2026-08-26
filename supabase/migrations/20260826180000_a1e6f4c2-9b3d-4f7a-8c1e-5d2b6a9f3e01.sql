CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'archived');

CREATE TABLE public.talent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  business_email text NOT NULL,
  company text NOT NULL,
  country text NOT NULL,
  required_role text NOT NULL,
  required_skills text NOT NULL,
  technology_stack text NOT NULL,
  number_of_engineers text NOT NULL,
  seniority text NOT NULL,
  expected_start_date text NOT NULL,
  expected_engagement_duration text NOT NULL,
  preferred_timezone_overlap text NOT NULL,
  project_description text NOT NULL,
  additional_information text,
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.talent_requests TO service_role;
GRANT SELECT, UPDATE ON public.talent_requests TO authenticated;
ALTER TABLE public.talent_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view talent requests" ON public.talent_requests FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update talent requests" ON public.talent_requests FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER talent_requests_set_updated_at BEFORE UPDATE ON public.talent_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX talent_requests_status_idx ON public.talent_requests (status);

CREATE TABLE public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  business_email text NOT NULL,
  project_type text NOT NULL,
  project_description text NOT NULL,
  current_stage text NOT NULL,
  expected_timeline text NOT NULL,
  approximate_budget_range text NOT NULL,
  required_technologies text,
  additional_information text,
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.project_requests TO service_role;
GRANT SELECT, UPDATE ON public.project_requests TO authenticated;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view project requests" ON public.project_requests FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update project requests" ON public.project_requests FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER project_requests_set_updated_at BEFORE UPDATE ON public.project_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX project_requests_status_idx ON public.project_requests (status);

CREATE TABLE public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  message text NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.career_applications TO service_role;
GRANT SELECT, UPDATE ON public.career_applications TO authenticated;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view career applications" ON public.career_applications FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update career applications" ON public.career_applications FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER career_applications_set_updated_at BEFORE UPDATE ON public.career_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX career_applications_status_idx ON public.career_applications (status);
