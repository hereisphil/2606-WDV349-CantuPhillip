import type { JSX, ReactNode } from "react"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import { estimateMinutes } from "./dashboard-model"

type TimeOfDay = "morning" | "afternoon" | "evening"

const messages = {
  greeting: {
    morning: "Good morning, {name}",
    afternoon: "Good afternoon, {name}",
    evening: "Good evening, {name}",
  },
  keepStreak: {
    one: "About {count} minute of review keeps your <b>{streak}-day streak</b> going.",
    other:
      "About {count} minutes of review keeps your <b>{streak}-day streak</b> going.",
  },
  startStreak: {
    one: "About {count} minute of review starts a new streak today.",
    other: "About {count} minutes of review starts a new streak today.",
  },
  caughtUp: "Nothing is due right now. Your memory is in good shape.",
} as const

const richTags = {
  b: (chunk: string) => <strong className="font-semibold">{chunk}</strong>,
}

function timeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) {
    return "morning"
  }
  if (hour >= 12 && hour < 18) {
    return "afternoon"
  }
  return "evening"
}

type DashboardGreetingProps = {
  name: string
  dueCount: number
  streakDays: number
  now: Date
}

export function DashboardGreeting({
  name,
  dueCount,
  streakDays,
  now,
}: DashboardGreetingProps): JSX.Element {
  const { format, plural, rich } = useFormatters()
  const minutes = estimateMinutes(dueCount)

  let status: ReactNode = messages.caughtUp
  if (dueCount > 0 && streakDays > 0) {
    status = rich(messages.keepStreak, richTags, {
      count: minutes,
      streak: streakDays,
    })
  } else if (dueCount > 0) {
    status = plural(minutes, messages.startStreak)
  }

  return (
    <header className="flex flex-col gap-1">
      <Heading level={1} className="text-2xl sm:text-3xl">
        {format(messages.greeting[timeOfDay(now)], { name })}
      </Heading>
      <Text variant="muted">{status}</Text>
    </header>
  )
}
