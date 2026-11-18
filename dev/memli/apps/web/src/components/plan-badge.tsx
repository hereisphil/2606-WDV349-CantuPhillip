import type { JSX } from "react"
import { Badge } from "@workspace/ui/components/badge"
import type { ViewerPlan } from "@/lib/queries"

export function PlanBadge({ plan }: { plan: ViewerPlan }): JSX.Element | null {
  if (plan !== "pro") return null

  return (
    <Badge
      variant="outline"
      // Neutral on purpose: amber belongs to the one main button on a screen.
      // Labels are 14 px and sentence case (REDESIGN.md 7.7, 9.1).
      className="h-auto border-border-strong px-1.5 py-0 text-sm leading-5 font-semibold text-foreground"
    >
      Pro
    </Badge>
  )
}
