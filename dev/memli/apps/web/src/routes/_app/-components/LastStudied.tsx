import type { JSX } from "react"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"

const messages = {
  lastStudied: "Last studied {time}",
  notStarted: "Not started yet",
} as const

export function LastStudied({
  at,
  now,
}: {
  at: string | null
  now: Date
}): JSX.Element {
  const { format, relativeTime } = useFormatters()

  return (
    <Text variant="small">
      {at === null
        ? messages.notStarted
        : format(messages.lastStudied, {
            time: relativeTime(new Date(at), now),
          })}
    </Text>
  )
}
