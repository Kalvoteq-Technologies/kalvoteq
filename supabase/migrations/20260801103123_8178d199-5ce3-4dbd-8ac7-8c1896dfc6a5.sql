
CREATE TABLE public.client_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website text,
  industry text,
  company_size text,
  country text,
  role_title text,
  needs text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_profiles TO authenticated;
GRANT ALL ON public.client_profiles TO service_role;

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client profile"
  ON public.client_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all client profiles"
  ON public.client_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Developers can view client profiles"
  ON public.client_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'developer'::app_role));
CREATE POLICY "Users can create their own client profile"
  ON public.client_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client profile"
  ON public.client_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all client profiles"
  ON public.client_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.developer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text NOT NULL,
  company_name text,
  years_experience integer NOT NULL DEFAULT 0,
  skills text[] NOT NULL DEFAULT '{}',
  primary_stack text,
  availability text,
  timezone text,
  github_url text,
  portfolio_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_profiles TO authenticated;
GRANT ALL ON public.developer_profiles TO service_role;

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own developer profile"
  ON public.developer_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all developer profiles"
  ON public.developer_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create their own developer profile"
  ON public.developer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own developer profile"
  ON public.developer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all developer profiles"
  ON public.developer_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_developer_profiles_updated_at
  BEFORE UPDATE ON public.developer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
