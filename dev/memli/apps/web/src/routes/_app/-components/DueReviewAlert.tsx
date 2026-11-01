import type { JSX, ReactNode } from "react"
import { Bell } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Text } from "@workspace/ui/components/text"

export type DueReviewData = {
  dueCount: number
}

type DueReviewAlertProps = DueReviewData & {
  stats?: ReactNode
}

function dueReviewMessage(dueCount: number): string {
  if (dueCount === 1) {
    return "You have 1 card due for review today."
  }

  return `You have ${dueCount} cards due for review today.`
}

export function DueReviewAlert({
  dueCount,
  stats,
}: DueReviewAlertProps): JSX.Element {
  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-xl bg-accent px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Bell
          className="mt-0.5 size-5 shrink-0 text-accent-foreground"
          aria-hidden="true"
        />
        <Text className="text-sm leading-5 font-medium text-foreground">
          {dueReviewMessage(dueCount)}
        </Text>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {stats}
        {/* Study sessions open at /study/$courseId (#48). */}
        <Button type="button" className="cursor-pointer sm:shrink-0">
          Start reviewing
        </Button>
      </div>
    </div>
  )
}
