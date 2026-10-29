import type { ComponentProps, JSX } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const headingVariants = cva("font-heading text-balance", {
  variants: {
    size: {
      "1": "text-3xl",
      "2": "text-2xl",
      "3": "text-xl",
      "4": "text-lg",
    },
    weight: {
      bold: "font-bold",
      semibold: "font-semibold",
      medium: "font-medium",
      normal: "font-normal",
    },
  },
  defaultVariants: {
    size: "1",
    weight: "bold",
  },
})

type HeadingSize = NonNullable<VariantProps<typeof headingVariants>["size"]>

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const

type HeadingLevel = keyof typeof headingTags
type HeadingTag = (typeof headingTags)[HeadingLevel]

const sizeByTag = {
  h1: "1",
  h2: "2",
  h3: "3",
  h4: "4",
} as const satisfies Record<HeadingTag, HeadingSize>

type HeadingProps = ComponentProps<"h1"> &
  VariantProps<typeof headingVariants> & {
    /**
     * Semantic level. Chooses the tag unless `as` is set.
     * Visual size still follows the rendered tag until `size` overrides it.
     */
    level?: HeadingLevel
    /** Rendered tag. Use with `size` when the element and the scale should differ. */
    as?: HeadingTag
  }

function Heading({
  className,
  level = 1,
  as,
  size,
  weight = "bold",
  ...props
}: HeadingProps): JSX.Element {
  const Tag = as ?? headingTags[level]
  const resolvedSize = size ?? sizeByTag[Tag]

  return (
    <Tag
      data-slot="heading"
      className={cn(headingVariants({ size: resolvedSize, weight, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Heading, headingVariants }
export type { HeadingLevel, HeadingTag }
