import type { JSX } from "react"
import { Check, Flame } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { DailyStudy } from "./dashboard-metrics"
import {
  studiedOn,
  weekDays,
  type WeekDay,
  type WeekDayStatus,
} from "./dashboard-model"

const messages = {
  heading: "This week",
  weekLabel: "Days you reached your goal this week",
  // Counts days with any study and forgives one day off ("never miss twice"),
  // so it says "days of study", not "in a row". Rule: REDESIGN.md section 5.7.
  daysOfStudy: {
    one: "{count} day of study",
    other: "{count} days of study",
  },
  today: {
    one: "<n>{count}</n> of {target} word today",
    other: "<n>{count}</n> of {target} words today",
  },
  goalMet: "You reached today's goal.",
  goalCleared: "You finished everything for today.",
  day: {
    met: "{day}, goal reached",
    partial: {
      one: "{day}, {count} of {target} word",
      other: "{day}, {count} of {target} words",
    },
    none: "{day}, no study",
    upcoming: "{day}",
  },
  todayLabel: "{label}, today",
} as const

const richTags = {
  n: (text: string) => (
    <strong className="font-semibold text-foreground-strong">{text}</strong>
  ),
}

const MARK_SIZE = 36
const RING_STROKE = 4
const RING_RADIUS = (MARK_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// Chart roles, not --primary, so the week stays quieter than the hero's button.
// "No study" and "to come" differ by line style, so color is never the only cue.
const markClasses = {
  met: "bg-viz-progress text-viz-on-progress",
  partial: "",
  none: "border-2 border-border-strong",
  upcoming: "border-2 border-dashed border-border-strong",
} as const satisfies Record<WeekDayStatus, string>

/** Some study, goal not reached: a ring filled by words studied over the goal. */
function PartialRing({ progress }: { progress: number }): JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`}
      aria-hidden="true"
      className="size-7 -rotate-90 @[17rem]:size-9"
    >
      <circle
        cx={MARK_SIZE / 2}
        cy={MARK_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        className="stroke-border"
      />
      <circle
        cx={MARK_SIZE / 2}
        cy={MARK_SIZE / 2}
        r={RING_RADIUS}
        fill="none"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
        className="stroke-viz-progress motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700"
      />
    </svg>
  )
}

function DayMarks({
  week,
  target,
}: {
  week: readonly WeekDay[]
  target: number
}): JSX.Element {
  const { weekday, format, plural } = useFormatters()

  return (
    <ol
      aria-label={messages.weekLabel}
      className="grid grid-cols-7 justify-items-center gap-1"
    >
      {week.map(({ date, isToday, status, studied }) => {
        const day = weekday(date, "long")
        const dayLabel =
          status === "partial"
            ? plural(studied, messages.day.partial, { day, target })
            : format(messages.day[status], { day })
        const label = isToday
          ? format(messages.todayLabel, { label: dayLabel })
          : dayLabel

        return (
          <li
            key={date.toISOString()}
            className="flex flex-col items-center gap-2"
          >
            {/* Seven short names ("Mon") need about 272 px; narrower cards (a 320 px phone) fall back to "M". */}
            <span
              aria-hidden="true"
              className={cn(
                "text-sm font-semibold text-foreground",
                isToday && "text-foreground-strong"
              )}
            >
              <span className="@[17rem]:hidden">{weekday(date, "narrow")}</span>
              <span className="hidden @[17rem]:inline">
                {weekday(date, "short")}
              </span>
            </span>
            {status === "partial" ? (
              <PartialRing
                progress={target > 0 ? Math.min(1, studied / target) : 0}
              />
            ) : (
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 items-center justify-center rounded-full @[17rem]:size-9",
                  markClasses[status]
                )}
              >
                {status === "met" ? (
                  <Check className="size-4 @[17rem]:size-5" strokeWidth={2.5} />
                ) : null}
              </span>
            )}
            <span className="sr-only">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function ThisWeek({
  days,
  target,
  now,
  clearedToday,
  streakDays,
}: {
  days: readonly DailyStudy[]
  target: number
  now: Date
  /** True when nothing is due and today's new words are used up. */
  clearedToday: boolean
  streakDays: number
}): JSX.Element {
  const { plural, rich, firstDayOfWeek } = useFormatters()
  const studiedToday = studiedOn(days, now)
  const week = weekDays(now, firstDayOfWeek, days, target, clearedToday)

  const todayLine =
    studiedToday >= target
      ? messages.goalMet
      : clearedToday
        ? messages.goalCleared
        : rich(messages.today, richTags, { count: studiedToday, target })

  return (
    <section aria-labelledby="week-heading" className="flex flex-col gap-4">
      <Heading id="week-heading" level={2} size="3">
        {messages.heading}
      </Heading>
      <Card className="@container gap-5 p-5">
        <DayMarks week={week} target={target} />
        <div className="flex flex-col gap-1 text-base">
          {/* Hidden at zero: no "0 days", no red. */}
          {streakDays > 0 ? (
            <p className="flex items-center gap-2 font-semibold text-foreground-strong">
              <Flame aria-hidden="true" className="size-5 text-streak" />
              {plural(streakDays, messages.daysOfStudy)}
            </p>
          ) : null}
          <p className="text-foreground">{todayLine}</p>
        </div>
      </Card>
    </section>
  )
}
