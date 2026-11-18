import type { JSX, ReactElement } from "react"
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
import { useOptionalViewer } from "@/components/session-provider"
import { useFormatters } from "@/lib/formatters"

const messages = {
  all: "All languages",
} as const

/**
 * A menu of learning languages, one link per choice, so each choice changes
 * the URL. The dashboard and the catalog each say which search param it sets.
 */
export function LanguageMenu({
  languages,
  current,
  label,
  trigger,
  link,
}: {
  /** BCP 47 tags to offer. The menu assumes at least two. */
  languages: readonly string[]
  current: string | undefined
  /** Heads the open menu, like "Studying". */
  label: string
  /** The button's text, with `{language}` for the current choice. */
  trigger: string
  /** The link for one choice; `undefined` means all languages. */
  link: (tag: string | undefined, isCurrent: boolean) => ReactElement
}): JSX.Element {
  const uiLocale = useOptionalViewer()?.uiLocale ?? "en"
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
        {format(trigger, { language: currentName })}
        <ChevronDown aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map(({ tag, name }) => (
            <DropdownMenuItem
              key={tag ?? "all"}
              className="min-h-11 justify-between text-base"
              render={link(tag, tag === current)}
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
