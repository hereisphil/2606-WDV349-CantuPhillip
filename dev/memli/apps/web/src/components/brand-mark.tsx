import type { JSX } from "react"
import { BookOpen } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const markSizes = {
  default: {
    row: "gap-2",
    iconWrap: "size-7 rounded-lg",
    icon: "size-4",
  },
  hero: {
    row: "gap-2.5 text-2xl tracking-tight sm:text-3xl",
    iconWrap: "size-9 rounded-xl sm:size-11",
    icon: "size-5 sm:size-6",
  },
} as const

export function BrandMark({
  size = "default",
  wordClassName,
}: {
  size?: keyof typeof markSizes
  wordClassName?: string
}): JSX.Element {
  const mark = markSizes[size]

  return (
    <span className={cn("inline-flex items-center font-semibold", mark.row)}>
      <span
        className={cn(
          "flex items-center justify-center bg-primary text-primary-foreground",
          mark.iconWrap
        )}
      >
        <BookOpen className={mark.icon} aria-hidden="true" />
      </span>
      <span className={wordClassName}>Memli</span>
    </span>
  )
}
