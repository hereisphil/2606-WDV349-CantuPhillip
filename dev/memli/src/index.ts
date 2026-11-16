const REALM = "Memli Staging"

function unauthorized(message: string): Response {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  })
}

// Hash both values, then compare the digests, so credential length and
// contents do not leak through response timing.
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [aDigest, bDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ])
  const aBytes = new Uint8Array(aDigest)
  const bBytes = new Uint8Array(bDigest)
  let mismatch = 0
  for (let i = 0; i < aBytes.length; i++) {
    mismatch |= aBytes[i] ^ bBytes[i]
  }
  return mismatch === 0
}

// The API's own error shape (@workspace/schemas/api/error), so the web app shows its error state.
function apiUnavailable(): Response {
  return Response.json({ error: { code: "INTERNAL_ERROR" } }, { status: 503 })
}

// Without this, /api/* falls through to the SPA fallback and answers with index.html.
function serve(request: Request, env: Env): Promise<Response> | Response {
  const { pathname } = new URL(request.url)
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return env.API ? env.API.fetch(request) : apiUnavailable()
  }
  return env.ASSETS.fetch(request)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only gate staging. Production and local skip the password check.
    if (env.ENVIRONMENT !== "staging") {
      return serve(request, env)
    }

    // Fail closed: if the gate is enabled but secrets are missing, deny.
    if (!env.BASIC_AUTH_USER || !env.BASIC_AUTH_PASS) {
      return unauthorized("Staging access is not configured.")
    }

    const authHeader = request.headers.get("Authorization")
    if (!authHeader) {
      return unauthorized("Access Denied")
    }

    const [scheme, encoded] = authHeader.split(" ")
    if (scheme !== "Basic" || !encoded) {
      return unauthorized("Access Denied")
    }

    let decoded: string
    try {
      decoded = atob(encoded)
    } catch {
      return unauthorized("Access Denied")
    }

    // Split only on the first ":" — passwords may legitimately contain colons.
    const separator = decoded.indexOf(":")
    const username = separator === -1 ? decoded : decoded.slice(0, separator)
    const password = separator === -1 ? "" : decoded.slice(separator + 1)

    const userOk = await timingSafeEqual(username, env.BASIC_AUTH_USER)
    const passOk = await timingSafeEqual(password, env.BASIC_AUTH_PASS)

    if (userOk && passOk) {
      return serve(request, env)
    }

    // Re-issue 401 (not 403) so the browser re-prompts for credentials.
    return unauthorized("Invalid Credentials")
  },
}
