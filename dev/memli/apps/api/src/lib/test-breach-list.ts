/// <reference types="node" />
import { createHash } from "node:crypto"
import { vi } from "vitest"

/**
 * Stands in for the Have I Been Pwned range API, so tests never call it.
 * It answers the way the real one does: hash endings that share a prefix.
 */
const RANGE_URL = "https://api.pwnedpasswords.com/range/"
const realFetch = globalThis.fetch

function sha1(password: string): string {
  return createHash("sha1").update(password).digest("hex").toUpperCase()
}

/** Every other request still goes where it was going. */
function stub(answer: (prefix: string) => Response): void {
  const fake: typeof fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    return url.startsWith(RANGE_URL)
      ? answer(url.slice(RANGE_URL.length))
      : realFetch(input, init)
  }
  vi.stubGlobal("fetch", fake)
}

/** From now on, exactly these passwords count as found in a breach. */
export function stubBreachedPasswords(breached: readonly string[] = []): void {
  const hashes = breached.map(sha1)
  stub((prefix) => {
    const lines = hashes
      .filter((hash) => hash.startsWith(prefix))
      .map((hash) => `${hash.slice(prefix.length)}:42`)
    return new Response(lines.join("\r\n"))
  })
}

/** From now on, the breach list is down. */
export function stubBreachListOutage(): void {
  stub(() => new Response("Service Unavailable", { status: 503 }))
}
