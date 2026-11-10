import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { useViewer } from "@/components/session-provider"
import { useFormatters } from "@/lib/formatters"

const messages = {
  label: "Studying",
  all: "All languages",
} as const

const chipClass =
  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium wrap-break-word transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"

// The router marks the chip whose search matches the URL exactly with aria-current="page".
const activeOptions = { exact: true } as const

/** Narrows the study regions to one learning language through `?studying=`. */
export function LanguageFilter({
  languages,
}: {
  /** BCP 47 tags. The filter assumes at least two. */
  languages: readonly string[]
}): JSX.Element {
  const { uiLocale } = useViewer()
  const { languageName } = useFormatters()
  const options = languages
    .map((tag) => ({ tag, name: languageName(tag) }))
    .sort((a, b) => a.name.localeCompare(b.name, uiLocale))

  return (
    <div
      role="group"
      aria-labelledby="studying-label"
      className="flex flex-wrap items-center gap-2"
    >
      <span
        id="studying-label"
        className="me-1 text-sm font-medium text-muted-foreground"
      >
        {messages.label}
      </span>
      <Link
        from="/dashboard"
        to="/dashboard"
        search={(prev) => ({ ...prev, studying: undefined })}
        activeOptions={activeOptions}
        className={chipClass}
      >
        {messages.all}
      </Link>
      {options.map(({ tag, name }) => (
        <Link
          key={tag}
          from="/dashboard"
          to="/dashboard"
          search={(prev) => ({ ...prev, studying: tag })}
          activeOptions={activeOptions}
          className={chipClass}
        >
          {name}
        </Link>
      ))}
    </div>
  )
}
