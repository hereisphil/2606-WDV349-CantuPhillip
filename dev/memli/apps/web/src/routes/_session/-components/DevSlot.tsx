/* eslint-disable memli/no-literal-ui-strings -- development-only placeholder, never shown to learners */
import type { JSX, ReactNode } from "react"

/**
 * Marks where a component from a later issue goes, so the layout around it
 * can be built and tested now. Callers render it only in development builds.
 */
export function DevSlot({
  name,
  issue,
  children,
}: {
  name: string
  /** The issue that fills this slot, e.g. "#50". */
  issue: string
  children?: ReactNode
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-muted-foreground/40 p-4 text-xs text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">{name}</span> slot · built
        in {issue} · development only
      </p>
      {children}
    </div>
  )
}
