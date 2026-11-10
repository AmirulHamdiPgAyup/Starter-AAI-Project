// hCaptcha token verification (design §12c). Server-side only: this file
// reads HCAPTCHA_SECRET and is never imported by a client component.
//
// FAIL CLOSED: anything other than an explicit `{ "success": true }` from
// api.hcaptcha.com means "not verified" — an empty token, an unset secret,
// a network failure, a slow reply (5-second cap) or an unreadable body all
// refuse the request. A broken verification service must never wave
// people through.

const VERIFY_URL = "https://api.hcaptcha.com/siteverify";

export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!token || !secret) {
    return false;
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return false;
    }
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Unreachable service, timeout or malformed JSON: deny, never allow.
    return false;
  }
}
