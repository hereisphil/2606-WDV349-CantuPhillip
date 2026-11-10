/* eslint-disable memli/no-literal-ui-strings -- development-only tool, never shown to learners */
import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { studyPreviewNames, type StudyPreviewName } from "./study-previews"

/** Links between seeded study session states, keeping the open deck and mode. */
export function StudyPreviewSwitcher({
  courseId,
  current,
}: {
  courseId: string
  current: StudyPreviewName
}): JSX.Element {
  return (
    <nav
      aria-label="Study session previews"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-2 text-xs"
    >
      <span className="font-medium text-muted-foreground">Preview</span>
      {studyPreviewNames.map((name) => (
        <Link
          key={name}
          to="/study/$courseId"
          params={{ courseId }}
          from="/study/$courseId"
          search={(prev) => ({ ...prev, preview: name })}
          aria-current={name === current ? "page" : undefined}
          className="touch-target inline-flex min-h-6 items-center rounded-md px-2 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        >
          {name}
        </Link>
      ))}
    </nav>
  )
}
