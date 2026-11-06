import type { JSX, ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import type { DueReviewData } from "./dashboard-metrics"

type DueReviewAlertProps = DueReviewData & {
  termsLearned: number
  stats?: ReactNode
}

function dueCountLabel(dueCount: number): string {
  return dueCount === 1 ? "1 card" : `${dueCount} cards`
}

function masteredDetail(termsLearned: number): string {
  const noun = termsLearned === 1 ? "term" : "terms"
  return `Maintain your streak by completing your daily goal. You've mastered ${termsLearned} ${noun} so far!`
}

export function DueReviewAlert({
  dueCount,
  termsLearned,
  stats,
}: DueReviewAlertProps): JSX.Element {
  const countLabel = dueCountLabel(dueCount)

  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-xl bg-accent px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col items-start gap-2">
        <Badge variant="secondary" className="bg-card text-primary uppercase">
          <Sparkles aria-hidden="true" />
          Learning overview
        </Badge>
        <Heading level={2} size="3">
          You have <span className="text-primary">{countLabel}</span> due for
          review today.
        </Heading>
        <Text variant="small">{masteredDetail(termsLearned)}</Text>
        {/* Study sessions open at /study/$courseId (#48). */}
        <Button type="button" size="lg">
          Start reviewing
        </Button>
      </div>
      {stats}
    </div>
  )
}
