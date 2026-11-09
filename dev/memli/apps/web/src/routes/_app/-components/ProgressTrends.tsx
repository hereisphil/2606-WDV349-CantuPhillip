import type { JSX } from "react"
import { TrendingUp } from "lucide-react"
import { Heading } from "@workspace/ui/components/heading"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { ProgressTrendsData } from "./dashboard-metrics"

const messages = {
  heading: "Your progress trends",
  consistency: "Consistency",
  consistencyChange: "{change} from last week",
  retention: "Retention",
  retentionAverage: "Global average: {percent}",
  newCards: "New cards",
  newCardsDetail: "Added this month",
} as const

function TrendCard({
  label,
  value,
  detail,
  detailClassName,
}: {
  label: string
  value: string
  detail: string
  detailClassName?: string
}): JSX.Element {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-secondary p-4">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="font-heading text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </dd>
      <dd className={cn("text-sm text-muted-foreground", detailClassName)}>
        {detail}
      </dd>
    </div>
  )
}

export function ProgressTrends({
  consistencyPercent,
  consistencyWeeklyChangePercent,
  retentionPercent,
  retentionGlobalAveragePercent,
  newCardsThisMonth,
}: ProgressTrendsData): JSX.Element {
  const { number, percent, format } = useFormatters()

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
        {messages.heading}
      </Heading>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TrendCard
          label={messages.consistency}
          value={percent(consistencyPercent / 100)}
          detail={format(messages.consistencyChange, {
            change: percent(consistencyWeeklyChangePercent / 100, {
              signed: true,
            }),
          })}
        />
        <TrendCard
          label={messages.retention}
          value={percent(retentionPercent / 100)}
          detail={format(messages.retentionAverage, {
            percent: percent(retentionGlobalAveragePercent / 100),
          })}
        />
        <TrendCard
          label={messages.newCards}
          value={number(newCardsThisMonth)}
          detail={messages.newCardsDetail}
          detailClassName="text-primary"
        />
      </dl>
    </section>
  )
}
