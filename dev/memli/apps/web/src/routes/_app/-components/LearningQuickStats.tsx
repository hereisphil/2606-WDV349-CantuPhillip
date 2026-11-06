import type { JSX } from "react"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import type { LearningQuickStatsData } from "./dashboard-metrics"

function QuickStatCard({
  value,
  label,
  description,
}: {
  value: string
  label: string
  description: string
}): JSX.Element {
  return (
    <Card
      size="sm"
      role="group"
      aria-label={description}
      className="items-center gap-0.5 bg-card py-3 text-center shadow-none"
    >
      <Heading
        level={3}
        size="2"
        aria-hidden="true"
        className="tracking-tight tabular-nums"
      >
        {value}
      </Heading>
      <Text variant="small" aria-hidden="true" className="text-xs">
        {label}
      </Text>
    </Card>
  )
}

export function LearningQuickStats({
  termsLearned,
  dailyReviewsCompleted,
  dailyReviewTarget,
}: LearningQuickStatsData): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      <QuickStatCard
        value={String(termsLearned)}
        label="Learned"
        description={`${termsLearned} terms learned`}
      />
      <QuickStatCard
        value={`${dailyReviewsCompleted}/${dailyReviewTarget}`}
        label="Daily Goal"
        description={`${dailyReviewsCompleted} of ${dailyReviewTarget} daily goal`}
      />
    </div>
  )
}
