import type { QueryClient } from "@tanstack/react-query"
import { redirect, type ParsedLocation } from "@tanstack/react-router"

import { sessionQuery } from "./queries"

/** Where a learner goes after signing in, unless they were sent elsewhere. */
export const HOME_PATH = "/dashboard"

/**
 * A path on this site to return to after signing in, or `undefined`. Never
 * another host (`//x`, `/\x`), so the sign-in page can't send anyone away.
 */
export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/")) return undefined
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined
  // Back to the form itself would loop.
  if (/^\/sign(in|up)(?![\w-])/.test(value)) return undefined
  return value
}

type GuardArgs = {
  context: { queryClient: QueryClient }
  location: ParsedLocation
}

/** Says whether a `?preview=` value names one of a page's snapshots. */
type IsPreview = (value: unknown) => Promise<boolean>

/**
 * `beforeLoad` for pages that need a learner: signed out goes to /signin.
 * In development only, a real `?preview=` snapshot opens without one.
 */
export function requireViewer(
  isPreview?: IsPreview
): (args: GuardArgs) => Promise<void> {
  return async ({ context, location }) => {
    const preview = (location.search as Record<string, unknown>).preview
    if (import.meta.env.DEV && isPreview !== undefined) {
      if (await isPreview(preview)) return
    }

    const viewer = await context.queryClient.ensureQueryData(sessionQuery)
    if (viewer === null) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href },
        replace: true,
      })
    }
  }
}

/** `beforeLoad` for /signin and /signup: a signed-in learner goes on in. */
export async function redirectViewer(
  { context }: GuardArgs,
  returnTo: string | undefined
): Promise<void> {
  const viewer = await context.queryClient.ensureQueryData(sessionQuery)
  if (viewer !== null) {
    throw redirect({ href: returnTo ?? HOME_PATH, replace: true })
  }
}

/**
 * After sign-in or sign-up: drop anything cached for whoever was here
 * before, and load the new session so the guards let the learner in.
 */
export async function startSession(queryClient: QueryClient): Promise<void> {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQuery.queryKey[0],
  })
  await queryClient.fetchQuery({ ...sessionQuery, staleTime: 0 })
}

/** After sign out: forget the learner and everything cached for them. */
export function endSession(queryClient: QueryClient): void {
  queryClient.setQueryData(sessionQuery.queryKey, null)
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== sessionQuery.queryKey[0],
  })
}
