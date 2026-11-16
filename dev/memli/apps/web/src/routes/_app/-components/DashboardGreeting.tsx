import type { JSX } from "react"
import { Heading } from "@workspace/ui/components/heading"
import { useFormatters } from "@/lib/formatters"

type TimeOfDay = "morning" | "afternoon" | "evening"

const messages = {
  greeting: {
    morning: "Good morning, {name}",
    afternoon: "Good afternoon, {name}",
    evening: "Good evening, {name}",
  },
  welcome: "Welcome to Memli, {name}",
} as const

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
  hasCourses: boolean
  now: Date
}

/**
 * Just the greeting. The hero carries the time and the count, and This week
 * carries the days in a row, so the greeting no longer repeats them.
 */
export function DashboardGreeting({
  name,
  hasCourses,
  now,
}: DashboardGreetingProps): JSX.Element {
  const { format } = useFormatters()
  const template = hasCourses
    ? messages.greeting[timeOfDay(now)]
    : messages.welcome

  return (
    <Heading level={1} className="text-2xl sm:text-3xl">
      {format(template, { name })}
    </Heading>
  )
}
