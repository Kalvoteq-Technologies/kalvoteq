import type { WelcomeRole } from "@/lib/email-templates/welcome";

export const SITE_URL = "https://kalvoteq.com";

/** Picks the most privileged role for welcome-email copy. */
export function resolveWelcomeRole(roles: readonly string[]): WelcomeRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("developer")) return "developer";
  if (roles.includes("client")) return "client";
  return "member";
}
