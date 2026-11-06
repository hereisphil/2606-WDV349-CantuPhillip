import type { JSX, ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function MarketingSection({
  id,
  title,
  lede,
  className,
  children,
}: {
  id: string
  title: string
  lede: string
  className?: string
  children: ReactNode
}): JSX.Element {
  return (
    <section
      id={id}
      className={cn("scroll-mt-(--marketing-header-clearance)", className)}
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            {lede}
          </p>
        </div>
        <div className="mt-14 lg:mt-16">{children}</div>
      </div>
    </section>
  )
}
