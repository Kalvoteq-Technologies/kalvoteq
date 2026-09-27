// Server-only: signs a short-lived, stateless OAuth "state" value carrying
// which admin initiated the LinkedIn connection. A plain GET redirect (both
// to LinkedIn and back from it) carries no Authorization header, so the
// admin check happens once, here, at the moment the flow is started —
// the signature lets the callback trust who asked without a lookup table.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60_000;

function secret(): string {
  const value = process.env["LINKEDIN_TOKEN_ENCRYPTION_KEY"];
  if (!value) throw new Error("LINKEDIN_TOKEN_ENCRYPTION_KEY is not configured");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createOAuthState(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + STATE_TTL_MS,
      nonce: randomBytes(8).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOAuthState(state: string): { userId: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId: string;
      exp: number;
    };
    if (typeof decoded.userId !== "string" || decoded.exp < Date.now()) return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
