import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useViewer } from "@/components/session-provider"
import { useFormatters } from "@/lib/formatters"

const messages = {
  label: "Studying",
  // "Studying: French" on the button, so the current choice shows without opening it.
  trigger: "Studying: {language}",
  all: "All languages",
} as const

/**
 * Narrows the course list to one learning language through `?studying=`.
 * A menu of links, not radios: each choice changes the URL, and the menu stays
 * uncontrolled because its value lives there.
 */
export function LanguageFilter({
  languages,
  current,
}: {
  /** BCP 47 tags of the other courses. The menu assumes at least two. */
  languages: readonly string[]
  current: string | undefined
}): JSX.Element {
  const { uiLocale } = useViewer()
  const { languageName, format } = useFormatters()
  const options = [
    { tag: undefined, name: messages.all },
    ...languages
      .map((tag) => ({ tag, name: languageName(tag) }))
      .sort((a, b) => a.name.localeCompare(b.name, uiLocale)),
  ]
  const currentName =
    options.find((option) => option.tag === current)?.name ?? messages.all

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="touch"
            className="data-popup-open:bg-muted"
          />
        }
      >
        {format(messages.trigger, { language: currentName })}
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{messages.label}</DropdownMenuLabel>
          {options.map(({ tag, name }) => (
            <DropdownMenuItem
              key={tag ?? "all"}
              className="min-h-11 justify-between text-base"
              render={
                <Link
                  from="/dashboard"
                  to="/dashboard"
                  search={(prev) => ({ ...prev, studying: tag })}
                  // Filtering keeps the learner where they are on the page.
                  resetScroll={false}
                  aria-current={tag === current ? "true" : undefined}
                />
              }
            >
              {name}
              {tag === current ? (
                <Check aria-hidden="true" className="size-5" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
