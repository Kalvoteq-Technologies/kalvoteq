import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";



const roleSchema = z.enum(["admin", "client", "developer"]);

export type TeamRole = z.infer<typeof roleSchema>;

export interface TeamMember {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  roles: TeamRole[];
  createdAt: string | null;
  lastSignInAt: string | null;
  confirmed: boolean;
}

/** Throws unless the calling user holds the admin role. Uses the caller's own RLS-scoped client. */
async function assertAdmin(supabase: {
  from: (t: "user_roles") => {
    select: (c: string) => {
      eq: (
        c: string,
        v: string,
      ) => {
        eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
      };
    };
  };
}, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) {
    throw new Error("Forbidden: admin access required");
  }
}

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: authUsers, error: authError }, { data: profiles }, { data: roles, error: rolesError }] =
      await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
        supabaseAdmin.from("profiles").select("id, display_name, avatar_url"),
        supabaseAdmin.from("user_roles").select("user_id, role"),
      ]);
    if (authError) throw authError;
    if (rolesError) throw rolesError;

    const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

    // Signed URLs for the private avatars bucket, so admins see faces in the team list.
    const avatarById = new Map<string, string>();
    await Promise.all(
      (profiles ?? [])
        .filter((p) => Boolean(p.avatar_url))
        .map(async (p) => {
          const { data } = await supabaseAdmin.storage
            .from("avatars")
            .createSignedUrl(p.avatar_url as string, 600);
          if (data?.signedUrl) avatarById.set(p.id, data.signedUrl);
        }),
    );

    return (authUsers?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      displayName:
        nameById.get(u.id) ??
        (u.user_metadata?.["display_name"] as string | undefined) ??
        null,
      avatarUrl: avatarById.get(u.id) ?? null,
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role as TeamRole),
      createdAt: u.created_at ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
      confirmed: Boolean(u.email_confirmed_at ?? u.confirmed_at),
    }));
  });

const createUserSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  displayName: z.string().trim().max(120).optional(),
  password: z.string().min(10).max(128),
  roles: z.array(roleSchema).max(3).default([]),
});



export const createTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createUserSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: data.displayName ? { display_name: data.displayName } : {},
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create that user");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: created.user.id, display_name: data.displayName || data.email.split("@")[0] || null });

    if (data.roles.length > 0) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert(data.roles.map((role) => ({ user_id: created.user!.id, role })));
      if (roleError) throw roleError;
    }

    try {
      const { resolveWelcomeRole, SITE_URL } = await import("@/lib/welcome.shared");
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("welcome", data.email, {
        templateData: {
          name: data.displayName || null,
          role: resolveWelcomeRole(data.roles),
          siteUrl: SITE_URL,
          temporaryPassword: data.password,
        },
        idempotencyKey: `welcome-${created.user.id}`,
      });
    } catch {
      // Welcome email is best-effort — never fail user creation on a send error.
    }

    return { id: created.user.id };
  });

const setRoleSchema = z.object({
  userId: z.string().uuid(),
  role: roleSchema,
  granted: z.boolean(),
});

async function countAdmins(admin: {
  from: (t: "user_roles") => {
    select: (c: string, o: { count: "exact"; head: true }) => {
      eq: (c: string, v: string) => Promise<{ count: number | null }>;
    };
  };
}): Promise<number> {
  const { count } = await admin.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
  return count ?? 0;
}

export const setTeamRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => setRoleSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.granted) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
      return { ok: true };
    }

    if (data.role === "admin") {
      if (data.userId === context.userId) {
        throw new Error("You cannot remove your own admin access");
      }
      if ((await countAdmins(supabaseAdmin as never)) <= 1) {
        throw new Error("At least one admin must remain");
      }
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw error;
    return { ok: true };
  });

const revokeSchema = z.object({ userId: z.string().uuid() });

export const revokeAllAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => revokeSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase as never, context.userId);
    if (data.userId === context.userId) {
      throw new Error("You cannot revoke your own access");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: theirRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    const isAdmin = (theirRoles ?? []).some((r) => r.role === "admin");
    if (isAdmin && (await countAdmins(supabaseAdmin as never)) <= 1) {
      throw new Error("At least one admin must remain");
    }

    const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (error) throw error;
    return { ok: true };
  });
