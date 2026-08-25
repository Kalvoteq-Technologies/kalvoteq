import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { myRolesQuery, type AppRole } from "@/lib/roles";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;
  const { data: roles = [], isLoading: rolesLoading } = useQuery(myRolesQuery(user?.id));

  const isAdmin = roles.includes("admin");
  const hasRole = (role: AppRole) => isAdmin || roles.includes(role);

  return {
    session,
    user,
    loading,
    roles,
    rolesLoading: Boolean(user) && rolesLoading,
    isAdmin,
    hasRole,
    hasAnyRole: (wanted: AppRole[]) => wanted.some(hasRole),
  };
}
