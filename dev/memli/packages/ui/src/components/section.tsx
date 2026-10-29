import type { ComponentProps, JSX } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const sectionVariants = cva("mx-auto w-full px-6", {
  variants: {
    width: {
      default: "max-w-6xl",
      narrow: "max-w-3xl",
      wide: "max-w-7xl",
      full: "max-w-none",
    },
    padding: {
      default: "py-16",
      compact: "py-8",
      none: "py-0",
    },
    background: {
      default: "",
      muted: "bg-muted",
      accent: "bg-accent",
      card: "bg-card",
    },
  },
  defaultVariants: {
    width: "default",
    padding: "default",
    background: "default",
  },
})

function Section({
  className,
  width = "default",
  padding = "default",
  background = "default",
  ...props
}: ComponentProps<"section"> &
  VariantProps<typeof sectionVariants>): JSX.Element {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ width, padding, background, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Section, sectionVariants }
