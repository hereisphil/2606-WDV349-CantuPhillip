import { useCallback, useEffect, useRef } from "react"

/**
 * Milliseconds since the component mounted, not counting time the tab was
 * hidden, so a learner who switches away doesn't look slow. Returns `null`
 * before the first effect runs. Feeds `elapsedMs` on SUBMIT and REVEAL;
 * `@workspace/core` caps it (`capElapsedMs`).
 *
 * Kept in refs, not state: nothing renders from it, it is only read when the
 * learner answers.
 */
export function useActiveTime(): () => number | null {
  const startedAt = useRef<number | null>(null)
  const hiddenMs = useRef(0)
  const hiddenSince = useRef<number | null>(null)

  useEffect(() => {
    const now = performance.now()
    startedAt.current = now
    hiddenMs.current = 0
    hiddenSince.current = document.hidden ? now : null

    function onVisibilityChange(): void {
      const at = performance.now()
      if (document.hidden) {
        hiddenSince.current = at
      } else if (hiddenSince.current !== null) {
        hiddenMs.current += at - hiddenSince.current
        hiddenSince.current = null
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  return useCallback(() => {
    if (startedAt.current === null) {
      return null
    }
    const now = performance.now()
    const hiddenNow =
      hiddenSince.current === null ? 0 : now - hiddenSince.current
    return now - startedAt.current - hiddenMs.current - hiddenNow
  }, [])
}
