import type { JSX } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"

const toneClasses = {
  default: "",
  // On the navy hero: the hero's own chip color, not the page's gray.
  hero: "bg-hero-chip text-hero-foreground",
} as const

const sizeClasses = {
  // Language codes are labels: 14 px semibold, never smaller (REDESIGN.md 9.1).
  default: "h-8 min-w-8 rounded-md px-1.5 text-sm",
  lg: "h-10 min-w-10 rounded-lg px-2 text-sm",
  // Inside the hero (a size container): small on a phone, large from 520 px.
  hero: "h-8 min-w-8 rounded-md px-1.5 text-sm @min-[520px]:h-10 @min-[520px]:min-w-10 @min-[520px]:rounded-lg @min-[520px]:px-2 @min-[520px]:text-sm",
} as const

function languageCode(tag: string): string {
  return new Intl.Locale(tag).language.toUpperCase()
}

/** "ES" on screen, "Spanish" (in the UI locale) to screen readers and on hover. */
export function LanguageBadge({
  tag,
  size = "default",
  tone = "default",
}: {
  tag: string
  size?: keyof typeof sizeClasses
  tone?: keyof typeof toneClasses
}): JSX.Element {
  const { languageName } = useFormatters()
  const name = languageName(tag)

  return (
    <Badge
      variant="secondary"
      title={name}
      className={cn("font-semibold", sizeClasses[size], toneClasses[tone])}
    >
      <span aria-hidden="true" translate="no">
        {languageCode(tag)}
      </span>
      <span className="sr-only">{name}</span>
    </Badge>
  )
}
