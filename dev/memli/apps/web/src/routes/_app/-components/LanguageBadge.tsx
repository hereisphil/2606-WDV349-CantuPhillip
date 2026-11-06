import type { JSX } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"

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
}: {
  tag: string
  size?: keyof typeof sizeClasses
}): JSX.Element {
  const { languageName } = useFormatters()
  const name = languageName(tag)

  return (
    <Badge
      variant="secondary"
      title={name}
      className={cn("font-semibold", sizeClasses[size])}
    >
      <span aria-hidden="true">{languageCode(tag)}</span>
      <span className="sr-only">{name}</span>
    </Badge>
  )
}
