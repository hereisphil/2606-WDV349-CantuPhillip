import type { ComponentProps, JSX } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const textVariants = cva("text-pretty", {
  variants: {
    variant: {
      body: "text-base leading-7",
      lead: "text-lg leading-relaxed text-muted-foreground",
      muted: "text-muted-foreground",
      small: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

function Text({
  className,
  variant = "body",
  ...props
}: ComponentProps<"p"> & VariantProps<typeof textVariants>): JSX.Element {
  return (
    <p
      data-slot="text"
      className={cn(textVariants({ variant, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Text, textVariants }
