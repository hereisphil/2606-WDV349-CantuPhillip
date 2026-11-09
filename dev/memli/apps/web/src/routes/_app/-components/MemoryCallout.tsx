import type { JSX } from "react"
import { Lightbulb } from "lucide-react"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import type { TrickyWord } from "./dashboard-metrics"

const messages = {
  heading: {
    one: "{count} word keeps slipping",
    other: "{count} words keep slipping",
  },
  detail:
    "You've forgotten these a few times. A new mnemonic can help them stick.",
  more: { other: "and {count} more" },
} as const

/** Words the learner keeps forgetting. Renders nothing when there are none. */
export function MemoryCallout({
  total,
  words,
}: {
  total: number
  words: readonly TrickyWord[]
}): JSX.Element | null {
  const { plural } = useFormatters()

  if (total === 0) {
    return null
  }

  const hidden = total - words.length

  return (
    <section
      aria-labelledby="slipping-heading"
      className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
    >
      <div className="flex items-center gap-2">
        <Lightbulb
          aria-hidden="true"
          className="size-5 shrink-0 text-streak-foreground"
        />
        <Heading
          id="slipping-heading"
          level={2}
          size="4"
          weight="semibold"
          className="text-base"
        >
          {plural(total, messages.heading)}
        </Heading>
      </div>
      <Text variant="small">{messages.detail}</Text>
      <ul className="flex flex-wrap items-center gap-2">
        {words.map((word) => (
          <li
            key={word.cardId}
            lang={word.learningLanguage}
            className="rounded-lg bg-muted px-2.5 py-1 text-sm font-medium"
          >
            {word.term}
          </li>
        ))}
        {hidden > 0 ? (
          <li className="text-sm text-muted-foreground">
            {plural(hidden, messages.more)}
          </li>
        ) : null}
      </ul>
    </section>
  )
}
