/* eslint-disable memli/no-literal-ui-strings -- development-only tool, never shown to learners */
import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import {
  studyPreviewGroups,
  studyPreviewNames,
  studyPreviews,
  type StudyPreviewName,
} from "./study-previews"

/** Links between seeded study session states, keeping the open course and mode. */
export function StudyPreviewSwitcher({
  courseId,
  current,
}: {
  courseId: string
  current: StudyPreviewName
}): JSX.Element {
  // Built here, not at module level, so production builds can drop the preview data entirely.
  const groups = Object.entries(studyPreviewGroups).map(([group, label]) => ({
    label,
    names: studyPreviewNames.filter(
      (name) => studyPreviews[name].group === group
    ),
  }))

  return (
    <nav
      aria-label="Study session previews"
      // Design-floor checks (e2e/floors.spec.ts) skip DEV-only tools.
      data-dev-only=""
      className="flex flex-col gap-1.5 rounded-lg border border-dashed border-muted-foreground/40 p-2 text-xs"
    >
      {groups.map(({ label, names }) => (
        <div key={label} className="flex flex-wrap items-center gap-1">
          <span className="w-16 shrink-0 font-medium text-muted-foreground">
            {label}
          </span>
          {names.map((name) => (
            <Link
              key={name}
              to="/study/$courseId"
              params={{ courseId }}
              from="/study/$courseId"
              search={(prev) => ({ ...prev, preview: name })}
              title={studyPreviews[name].description}
              aria-current={name === current ? "page" : undefined}
              className="touch-target inline-flex min-h-6 items-center rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >
              {name}
            </Link>
          ))}
        </div>
      ))}
      <p className="text-muted-foreground">
        {studyPreviews[current].description}
      </p>
    </nav>
  )
}
