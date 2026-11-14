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
  default: "h-8 min-w-8 rounded-md px-1.5 text-xs",
  lg: "h-10 min-w-10 rounded-lg px-2 text-sm",
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
      <span aria-hidden="true">{languageCode(tag)}</span>
      <span className="sr-only">{name}</span>
    </Badge>
  )
}
