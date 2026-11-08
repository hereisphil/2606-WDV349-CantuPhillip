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
    other:
      "About {duration} of review keeps your <b>{count}-day streak</b> going.",
  },
  startStreak: "About {duration} of review starts a new streak today.",
  caughtUp: "Nothing is due right now. Your memory is in good shape.",
  welcome: "Welcome to Memli. Let's find your first deck.",
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
  hasDecks: boolean
  dueCount: number
  streakDays: number
  now: Date
}

export function DashboardGreeting({
  name,
  hasDecks,
  dueCount,
  streakDays,
  now,
}: DashboardGreetingProps): JSX.Element {
  const { format, rich, duration } = useFormatters()
  const time = duration(estimateMinutes(dueCount))

  let status: ReactNode = messages.caughtUp
  if (!hasDecks) {
    status = messages.welcome
  } else if (dueCount > 0 && streakDays > 0) {
    status = rich(messages.keepStreak, richTags, {
      count: streakDays,
      duration: time,
    })
  } else if (dueCount > 0) {
    status = format(messages.startStreak, { duration: time })
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
