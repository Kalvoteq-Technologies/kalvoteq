// Server-only: thin wrapper around LinkedIn's OAuth and Posts REST APIs.
// Kept as the single place that knows LinkedIn's exact endpoints/headers so
// the rest of the app deals in plain functions, not HTTP details.

// Versioned per LinkedIn's YYYYMM scheme; override without a code change if
// this version ages out of LinkedIn's supported rolling window.
const LINKEDIN_API_VERSION = process.env["LINKEDIN_API_VERSION"] || "202601";
const API_BASE = "https://api.linkedin.com/rest";

function config(): { clientId: string; clientSecret: string; redirectUri: string } {
  const clientId = process.env["LINKEDIN_CLIENT_ID"];
  const clientSecret = process.env["LINKEDIN_CLIENT_SECRET"];
  const redirectUri = process.env["LINKEDIN_REDIRECT_URI"];
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "LinkedIn is not configured: set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizationUrl(state: string): string {
  const { clientId, redirectUri } = config();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "w_organization_social r_organization_social rw_organization_admin",
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

async function requestToken(body: URLSearchParams): Promise<LinkedInTokenResponse> {
  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`LinkedIn token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<LinkedInTokenResponse>;
}

export function exchangeCodeForToken(code: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret, redirectUri } = config();
  return requestToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  );
}

export function refreshAccessToken(refreshToken: string): Promise<LinkedInTokenResponse> {
  const { clientId, clientSecret } = config();
  return requestToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  );
}

function restHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

export interface AdminOrganization {
  urn: string;
  name: string;
}

/** The Kalvoteq admin who just connected must administer exactly the one Company Page we post as. */
export async function fetchAdminOrganization(accessToken: string): Promise<AdminOrganization> {
  const aclRes = await fetch(
    `${API_BASE}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`,
    { headers: restHeaders(accessToken) },
  );
  if (!aclRes.ok) {
    throw new Error(
      `Could not list LinkedIn organizations: ${aclRes.status} ${await aclRes.text()}`,
    );
  }
  const acl = (await aclRes.json()) as { elements?: { organization?: string }[] };
  const urn = acl.elements?.[0]?.organization;
  if (!urn) {
    throw new Error(
      "This LinkedIn account does not administer any organization page. Sign in with an account that is an admin of the Kalvoteq Company Page.",
    );
  }
  const id = urn.split(":").pop();

  let name = urn;
  try {
    const orgRes = await fetch(`${API_BASE}/organizations/${id}`, {
      headers: restHeaders(accessToken),
    });
    if (orgRes.ok) {
      const org = (await orgRes.json()) as { localizedName?: string; vanityName?: string };
      name = org.localizedName ?? org.vanityName ?? urn;
    }
  } catch {
    // Name lookup is best-effort; the URN alone is enough to publish.
  }

  return { urn, name };
}

export async function createLinkedInPost(
  accessToken: string,
  organizationUrn: string,
  commentary: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { ...restHeaders(accessToken), "Content-Type": "application/json" },
    body: JSON.stringify({
      author: organizationUrn,
      commentary,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`LinkedIn post failed: ${res.status} ${await res.text()}`);
  }
  const postUrn = res.headers.get("x-restli-id");
  if (!postUrn) throw new Error("LinkedIn did not return a post id");
  return postUrn;
}
