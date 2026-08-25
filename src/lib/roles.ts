import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "client" | "developer";

export const ROLES: AppRole[] = ["admin", "client", "developer"];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  client: "Client",
  developer: "Developer",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Full platform access: editorial, team roles, and every portal.",
  client: "Access to the client portal: engagements, reports, and deliverables.",
  developer: "Access to the developer workspace: assignments and delivery notes.",
};

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const sel = (s: string): string => s;

export const myRolesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["roles", "mine", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async (): Promise<AppRole[]> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(sel("role"))
        .eq("user_id", userId!)
        .returns<{ role: AppRole }[]>();
      if (error) throw error;
      return (data ?? []).map((r) => r.role);
    },
  });

export const teamQuery = () =>
  queryOptions({
    queryKey: ["roles", "team"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase
          .from("profiles")
          .select(sel("id, display_name, avatar_url, created_at"))
          .order("created_at")
          .returns<ProfileRow[]>(),
        supabase
          .from("user_roles")
          .select(sel("id, user_id, role, created_at"))
          .returns<UserRoleRow[]>(),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      return (profiles ?? []).map((profile) => ({
        ...profile,
        roles: (roles ?? []).filter((r) => r.user_id === profile.id),
      }));
    },
  });

/** Client-side role check used by protected route layouts (they run with ssr: false). */
export async function requireRole(role: AppRole, href: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw redirect({ to: "/auth", search: { redirect: href } });

  const check = async (r: AppRole) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", r)
      .maybeSingle();
    return !error && Boolean(data);
  };

  // Admins have access to every area.
  if (await check(role)) return;
  if (role !== "admin" && (await check("admin"))) return;

  throw redirect({ to: "/unauthorized", search: { required: role } });
}
