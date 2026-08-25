CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DO $do$
DECLARE
  p record;
  stmt text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE (coalesce(qual, '') || coalesce(with_check, '')) LIKE '%has_role(%'
  LOOP
    stmt := format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    IF p.qual IS NOT NULL THEN
      stmt := stmt || format(' USING (%s)', replace(p.qual, 'has_role(', 'private.has_role('));
    END IF;
    IF p.with_check IS NOT NULL THEN
      stmt := stmt || format(' WITH CHECK (%s)', replace(p.with_check, 'has_role(', 'private.has_role('));
    END IF;
    EXECUTE stmt;
  END LOOP;
END
$do$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);