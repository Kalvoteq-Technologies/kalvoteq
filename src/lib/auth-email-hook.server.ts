// Server-only: dispatches Supabase's "Send Email" auth hook payload to the
// matching branded template via Resend. Load inside the webhook route handler,
// never import from client code.

const SITE_NAME = "kalvoteq";

interface HookUser {
  email?: string;
  new_email?: string;
}

interface HookEmailData {
  token: string;
  token_hash: string;
  token_new?: string;
  token_hash_new?: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

function verifyUrl(tokenHash: string, type: string, redirectTo: string): string {
  const supabaseUrl = process.env["SUPABASE_URL"];
  if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");
  const params = new URLSearchParams({ token: tokenHash, type, redirect_to: redirectTo });
  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}

export async function dispatchAuthEmail(user: HookUser, emailData: HookEmailData): Promise<void> {
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
  const { SITE_URL } = await import("@/lib/welcome.shared");
  const { token, token_hash, token_new, token_hash_new, redirect_to, email_action_type } = emailData;

  switch (email_action_type) {
    case "signup": {
      if (!user.email) throw new Error("Missing user.email for signup email");
      await sendTemplateEmail("auth-signup", user.email, {
        templateData: {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          recipient: user.email,
          confirmationUrl: verifyUrl(token_hash, "signup", redirect_to),
        },
        idempotencyKey: `auth-signup-${token_hash}`,
      });
      return;
    }
    case "invite": {
      if (!user.email) throw new Error("Missing user.email for invite email");
      await sendTemplateEmail("auth-invite", user.email, {
        templateData: {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          confirmationUrl: verifyUrl(token_hash, "invite", redirect_to),
        },
        idempotencyKey: `auth-invite-${token_hash}`,
      });
      return;
    }
    case "magiclink": {
      if (!user.email) throw new Error("Missing user.email for magic link email");
      await sendTemplateEmail("auth-magic-link", user.email, {
        templateData: {
          siteName: SITE_NAME,
          confirmationUrl: verifyUrl(token_hash, "magiclink", redirect_to),
        },
        idempotencyKey: `auth-magiclink-${token_hash}`,
      });
      return;
    }
    case "recovery": {
      if (!user.email) throw new Error("Missing user.email for recovery email");
      await sendTemplateEmail("auth-recovery", user.email, {
        templateData: {
          siteName: SITE_NAME,
          confirmationUrl: verifyUrl(token_hash, "recovery", redirect_to),
        },
        idempotencyKey: `auth-recovery-${token_hash}`,
      });
      return;
    }
    case "email_change": {
      if (!user.email) throw new Error("Missing user.email for email change");
      const hasSecurePair = Boolean(token_new && token_hash_new);

      if (hasSecurePair) {
        // Notify the current address, confirming with the "new" token pair.
        await sendTemplateEmail("auth-email-change", user.email, {
          templateData: {
            siteName: SITE_NAME,
            oldEmail: user.email,
            email: user.email,
            newEmail: user.new_email ?? user.email,
            confirmationUrl: verifyUrl(token_hash_new!, "email_change", redirect_to),
          },
          idempotencyKey: `auth-email-change-old-${token_hash_new}`,
        });
        // Notify the new address, confirming with the original token pair.
        if (user.new_email) {
          await sendTemplateEmail("auth-email-change", user.new_email, {
            templateData: {
              siteName: SITE_NAME,
              oldEmail: user.email,
              email: user.new_email,
              newEmail: user.new_email,
              confirmationUrl: verifyUrl(token_hash, "email_change", redirect_to),
            },
            idempotencyKey: `auth-email-change-new-${token_hash}`,
          });
        }
        return;
      }

      const recipient = user.new_email ?? user.email;
      await sendTemplateEmail("auth-email-change", recipient, {
        templateData: {
          siteName: SITE_NAME,
          oldEmail: user.email,
          email: recipient,
          newEmail: user.new_email ?? user.email,
          confirmationUrl: verifyUrl(token_hash, "email_change", redirect_to),
        },
        idempotencyKey: `auth-email-change-${token_hash}`,
      });
      return;
    }
    case "reauthentication": {
      if (!user.email) throw new Error("Missing user.email for reauthentication email");
      await sendTemplateEmail("auth-reauthentication", user.email, {
        templateData: { token },
        idempotencyKey: `auth-reauth-${token_hash}`,
      });
      return;
    }
    default:
      // Security/notification-only hook types (password_changed_notification, etc.)
      // have no custom template yet — skip sending rather than guessing content.
      console.warn(`[auth-email-hook] No template for email_action_type "${email_action_type}", skipped.`);
      return;
  }
}
