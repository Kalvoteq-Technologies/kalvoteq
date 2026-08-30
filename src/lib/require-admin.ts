/** Throws unless the calling user holds the admin role. Uses the caller's own RLS-scoped client. */
export async function requireAdmin(
  supabase: {
    from: (t: "user_roles") => {
      select: (c: string) => {
        eq: (
          c: string,
          v: string,
        ) => {
          eq: (
            c: string,
            v: string,
          ) => { maybeSingle: () => Promise<{ data: unknown; error: unknown }> };
        };
      };
    };
  },
  userId: string,
): Promise<void> {
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
