import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { LanguageMenu } from "@/components/language-menu"

const messages = {
  label: "Studying",
  // "Studying: French" on the button, so the current choice shows without opening it.
  trigger: "Studying: {language}",
} as const

/** Narrows the dashboard's course list to one learning language through `?studying=`. */
export function LanguageFilter({
  languages,
  current,
}: {
  /** BCP 47 tags of the other courses. The menu assumes at least two. */
  languages: readonly string[]
  current: string | undefined
}): JSX.Element {
  return (
    <LanguageMenu
      languages={languages}
      current={current}
      label={messages.label}
      trigger={messages.trigger}
      link={(tag, isCurrent) => (
        <Link
          from="/dashboard"
          to="/dashboard"
          search={(prev) => ({ ...prev, studying: tag })}
          // Filtering keeps the learner where they are on the page.
          resetScroll={false}
          aria-current={isCurrent ? "true" : undefined}
        />
      )}
    />
  )
}
