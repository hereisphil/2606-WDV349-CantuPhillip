import { useCallback, useEffect, useRef } from "react"

/**
 * Ms since mount minus hidden-tab time, so switching away doesn't look slow. `null` before the first effect.
 * Feeds `elapsedMs` on SUBMIT and REVEAL, which core caps (`capElapsedMs`). Refs, since nothing renders from it.
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
