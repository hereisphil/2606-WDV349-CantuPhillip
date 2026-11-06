import type { JSX } from "react"
import { Badge } from "@workspace/ui/components/badge"
import type { ViewerPlan } from "@/components/session-provider"

export function PlanBadge({ plan }: { plan: ViewerPlan }): JSX.Element | null {
  if (plan !== "pro") return null

  return (
    <Badge
      variant="outline"
      className="h-4 border-amber-500/30 bg-amber-500/10 px-1.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300"
    >
      Pro
    </Badge>
  )
}
