import type { JSX } from "react"
import { Check, Flame } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { DailyReviews } from "./dashboard-metrics"
import {
  reviewsOn,
  weekDays,
  type WeekDay,
  type WeekDayStatus,
} from "./dashboard-model"

const messages = {
  heading: "This week",
  goalTitle: "Daily goal",
  goalOf: "of {target}",
  goalRemaining: {
    one: "{count} more review to reach today's goal.",
    other: "{count} more reviews to reach today's goal.",
  },
  goalMet: "Today's goal is done. Extra reviews still count.",
  weekLabel: "Daily goal this week",
  day: {
    met: "{day}, goal met",
    missed: "{day}, goal missed",
    "in-progress": "{day}, today, in progress",
    upcoming: "{day}, upcoming",
  },
  todayMet: "{day}, today, goal met",
  streak: "Streak",
  streakDays: {
    one: "{count} day",
    other: "{count} days",
  },
  mastered: "Words mastered",
} as const

const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function GoalRing({
  completed,
  target,
}: {
  completed: number
  target: number
}): JSX.Element {
  const { number, format } = useFormatters()
  const progress = target > 0 ? Math.min(1, completed / target) : 0

  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" aria-hidden="true" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          className="stroke-primary motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
        />
      </svg>
      <p className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl leading-none font-bold tabular-nums">
          {number(completed)}
        </span>{" "}
        <span className="text-xs text-muted-foreground tabular-nums">
          {format(messages.goalOf, { target })}
        </span>
      </p>
    </div>
  )
}

const dotClasses = {
  met: "bg-primary text-primary-foreground",
  missed: "bg-muted",
  "in-progress": "bg-background ring-2 ring-primary",
  upcoming: "border border-dashed border-muted-foreground/40",
} as const satisfies Record<WeekDayStatus, string>

function WeekDots({ week }: { week: readonly WeekDay[] }): JSX.Element {
  const { weekday, format } = useFormatters()

  return (
    <ol aria-label={messages.weekLabel} className="grid grid-cols-7 gap-1">
      {week.map(({ date, isToday, status }) => {
        const day = weekday(date, "long")
        const label =
          isToday && status === "met"
            ? format(messages.todayMet, { day })
            : format(messages.day[status], { day })

        return (
          <li
            key={date.toISOString()}
            className="flex flex-col items-center gap-1.5"
          >
            <span
              aria-hidden="true"
              className={cn(
                "text-xs text-muted-foreground",
                isToday && "font-semibold text-foreground"
              )}
            >
              {weekday(date, "narrow")}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                dotClasses[status]
              )}
            >
              {status === "met" ? <Check className="size-4" /> : null}
            </span>
            <span className="sr-only">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function ThisWeek({
  days,
  reviewTarget,
  now,
  streakDays,
  wordsMastered,
}: {
  days: readonly DailyReviews[]
  reviewTarget: number
  now: Date
  streakDays: number
  wordsMastered: number
}): JSX.Element {
  const { number, plural, firstDayOfWeek } = useFormatters()
  const reviewsToday = reviewsOn(days, now)
  const remaining = Math.max(0, reviewTarget - reviewsToday)
  const week = weekDays(now, firstDayOfWeek, days, reviewTarget)

  return (
    <aside aria-labelledby="week-heading" className="flex flex-col gap-4">
      <Heading id="week-heading" level={2} size="3">
        {messages.heading}
      </Heading>
      <Card className="@container gap-6 p-5">
        <div className="grid gap-6 @lg:grid-cols-2 @lg:items-center @lg:gap-8">
          <div className="flex items-center gap-4">
            <GoalRing completed={reviewsToday} target={reviewTarget} />
            <div className="flex min-w-0 flex-col gap-1">
              <Heading
                level={3}
                size="4"
                weight="semibold"
                className="text-base"
              >
                {messages.goalTitle}
              </Heading>
              <Text variant="small">
                {remaining > 0
                  ? plural(remaining, messages.goalRemaining)
                  : messages.goalMet}
              </Text>
            </div>
          </div>
          <WeekDots week={week} />
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="flex flex-col-reverse gap-1">
            <dt className="text-xs text-muted-foreground">{messages.streak}</dt>
            <dd className="flex items-center gap-1.5 font-heading text-lg font-semibold tabular-nums">
              <Flame
                aria-hidden="true"
                className="size-4 text-streak-foreground"
              />
              {plural(streakDays, messages.streakDays)}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-1">
            <dt className="text-xs text-muted-foreground">
              {messages.mastered}
            </dt>
            <dd className="font-heading text-lg font-semibold tabular-nums">
              {number(wordsMastered)}
            </dd>
          </div>
        </dl>
      </Card>
    </aside>
  )
}
