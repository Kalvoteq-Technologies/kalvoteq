// Server-only: reads/writes the single connected LinkedIn account row, and
// transparently refreshes the access token when it's expired or close to it.
// Callers only ever see a plaintext access token in memory, never the stored
// ciphertext, and it is never returned to client code.

export interface ConnectedLinkedInAccount {
  id: string;
  organizationUrn: string;
  organizationName: string;
  accessToken: string;
}

export async function getConnectedAccount(): Promise<ConnectedLinkedInAccount | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { decryptToken, encryptToken } = await import("./crypto.server");

  const { data: account, error } = await supabaseAdmin
    .from("linkedin_accounts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!account) return null;

  const expiresAt = new Date(account.access_token_expires_at).getTime();
  const now = Date.now();
  const stillValid = now < expiresAt - 5 * 60_000;

  if (stillValid) {
    return {
      id: account.id,
      organizationUrn: account.organization_urn,
      organizationName: account.organization_name,
      accessToken: decryptToken(account.access_token_encrypted),
    };
  }

  if (!account.refresh_token_encrypted) {
    throw new Error(
      "The LinkedIn connection has expired. Reconnect LinkedIn from the admin panel.",
    );
  }

  const { refreshAccessToken } = await import("./client.server");
  const refreshed = await refreshAccessToken(decryptToken(account.refresh_token_encrypted));

  const update: {
    access_token_encrypted: string;
    access_token_expires_at: string;
    refresh_token_encrypted?: string;
    refresh_token_expires_at?: string;
  } = {
    access_token_encrypted: encryptToken(refreshed.access_token),
    access_token_expires_at: new Date(now + refreshed.expires_in * 1000).toISOString(),
  };
  if (refreshed.refresh_token) {
    update.refresh_token_encrypted = encryptToken(refreshed.refresh_token);
    update.refresh_token_expires_at = new Date(
      now + (refreshed.refresh_token_expires_in ?? 0) * 1000,
    ).toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from("linkedin_accounts")
    .update(update)
    .eq("id", account.id);
  if (updateError) throw updateError;

  return {
    id: account.id,
    organizationUrn: account.organization_urn,
    organizationName: account.organization_name,
    accessToken: refreshed.access_token,
  };
}

export async function saveConnectedAccount(input: {
  organizationUrn: string;
  organizationName: string;
  accessToken: string;
  refreshToken?: string | undefined;
  expiresInSeconds: number;
  refreshTokenExpiresInSeconds?: number | undefined;
  connectedBy: string;
}): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { encryptToken } = await import("./crypto.server");

  const now = Date.now();
  // Single-account model: replace whatever was connected before.
  await supabaseAdmin
    .from("linkedin_accounts")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { error } = await supabaseAdmin.from("linkedin_accounts").insert({
    organization_urn: input.organizationUrn,
    organization_name: input.organizationName,
    access_token_encrypted: encryptToken(input.accessToken),
    refresh_token_encrypted: input.refreshToken ? encryptToken(input.refreshToken) : null,
    access_token_expires_at: new Date(now + input.expiresInSeconds * 1000).toISOString(),
    refresh_token_expires_at: input.refreshTokenExpiresInSeconds
      ? new Date(now + input.refreshTokenExpiresInSeconds * 1000).toISOString()
      : null,
    connected_by: input.connectedBy,
  });
  if (error) throw error;
}
