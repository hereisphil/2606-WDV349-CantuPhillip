import type { JSX } from "react"
import { Medal, TrendingUp } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import type { ProgressTrendsData } from "./dashboard-metrics"

type TrendBlock = {
  label: string
  value: string
  detail: string
  detailClassName?: string
  medal?: boolean
}

function weeklyChangeDetail(changePercent: number): string {
  const sign = changePercent > 0 ? "+" : ""
  return `${sign}${changePercent}% from last week`
}

function TrendCard({
  label,
  value,
  detail,
  detailClassName,
  medal = false,
}: TrendBlock): JSX.Element {
  return (
    <Card
      role="group"
      aria-label={`${label}: ${value}. ${detail}`}
      className="gap-1 bg-secondary px-4 py-4 shadow-none ring-0"
    >
      <Text
        variant="small"
        aria-hidden="true"
        className="text-xs font-medium tracking-wide uppercase"
      >
        {label}
      </Text>
      <Heading
        level={3}
        size="2"
        aria-hidden="true"
        className="flex items-center gap-1.5 tracking-tight tabular-nums"
      >
        {value}
        {medal ? (
          <Medal className="size-5 text-streak-foreground" aria-hidden="true" />
        ) : null}
      </Heading>
      <Text variant="small" aria-hidden="true" className={detailClassName}>
        {detail}
      </Text>
    </Card>
  )
}

export function ProgressTrends({
  consistencyPercent,
  consistencyWeeklyChangePercent,
  retentionPercent,
  retentionGlobalAveragePercent,
  newCardsThisMonth,
  rankLabel,
  rankCohort,
}: ProgressTrendsData): JSX.Element {
  return (
    <section
      aria-labelledby="progress-trends-heading"
      className="flex flex-col gap-4"
    >
      <Heading
        id="progress-trends-heading"
        level={2}
        size="3"
        className="flex items-center gap-2"
      >
        <TrendingUp className="size-5 text-primary" aria-hidden="true" />
        Your Progress Trends
      </Heading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TrendCard
          label="Consistency"
          value={`${consistencyPercent}%`}
          detail={weeklyChangeDetail(consistencyWeeklyChangePercent)}
        />
        <TrendCard
          label="Retention"
          value={`${retentionPercent}%`}
          detail={`Global average: ${retentionGlobalAveragePercent}%`}
        />
        <TrendCard
          label="New Cards"
          value={String(newCardsThisMonth)}
          detail="Added this month"
          detailClassName="text-primary"
        />
        <TrendCard label="Rank" value={rankLabel} detail={rankCohort} medal />
      </div>
    </section>
  )
}
