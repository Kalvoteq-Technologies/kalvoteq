-- Let authenticated clients see their own pre-onboarding lead submissions
-- (Start a Project / Scale Your Team) when the submission's email matches
-- their account email — connects public-form leads to the client portal
-- once that person has an account.

CREATE POLICY "Clients view their own project requests"
  ON public.project_requests FOR SELECT TO authenticated
  USING (lower(business_email) = lower((auth.jwt() ->> 'email')));

CREATE POLICY "Clients view their own talent requests"
  ON public.talent_requests FOR SELECT TO authenticated
  USING (lower(business_email) = lower((auth.jwt() ->> 'email')));
