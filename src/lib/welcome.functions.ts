import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveWelcomeRole, SITE_URL } from "@/lib/welcome.shared";

/**
 * Sends the role-aware welcome email to the signed-in caller. Safe to call
 * after signup: the recipient is always the authenticated user's own address.
 */
export const sendWelcomeEmailToSelf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: authUser } = await supabase.auth.getUser();
    const email = authUser?.user?.email;
    if (!email) return { sent: false as const };

    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    ]);

    const role = resolveWelcomeRole((roles ?? []).map((r) => r.role as string));
    const name =
      profile?.display_name ??
      (authUser?.user?.user_metadata?.["display_name"] as string | undefined) ??
      null;

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const result = await sendTemplateEmail("welcome", email, {
      templateData: { name, role, siteUrl: SITE_URL },
      idempotencyKey: `welcome-${userId}`,
    });

    return { sent: result.sent };
  });
