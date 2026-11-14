import type { JSX } from "react"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck } from "./dashboard-metrics"
import { deckAction, deckTotal, masteredRatio } from "./dashboard-model"
import { LanguageBadge } from "./LanguageBadge"
import { LastStudied } from "./LastStudied"

const messages = {
  heading: "Continue learning",
  due: "Due",
  newToday: "New today",
  mastered: "{percent} mastered",
  totalCards: {
    one: "of {count} card",
    other: "of {count} cards",
  },
  legend: {
    mastered: "{count} mastered",
    learning: "{count} learning",
    unseen: "{count} not started",
  },
  caughtUp: "Nothing due in this deck. New reviews arrive as you need them.",
} as const

const segments = [
  { key: "mastered", className: "bg-chart-1" },
  { key: "learning", className: "bg-chart-2" },
  { key: "unseen", className: "bg-chart-4" },
] as const

function MasteryBar({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { percent, plural, format } = useFormatters()
  const counts = {
    mastered: deck.masteredCount,
    learning: deck.learningCount,
    unseen: deck.unseenCount,
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-heading text-lg font-semibold tabular-nums">
          {format(messages.mastered, { percent: percent(masteredRatio(deck)) })}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {plural(deckTotal(deck), messages.totalCards)}
        </span>
      </p>
      <div
        aria-hidden="true"
        className="flex h-2.5 overflow-hidden rounded-full bg-muted"
      >
        {segments.map(({ key, className }) =>
          counts[key] > 0 ? (
            <div
              key={key}
              className={className}
              style={{ flexGrow: counts[key] }}
            />
          ) : null
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground tabular-nums">
        {segments.map(({ key, className }) => (
          <li key={key} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${className}`}
            />
            {format(messages.legend[key], { count: counts[key] })}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FocusDeckCard({
  deck,
  now,
}: {
  deck: DashboardDeck
  now: Date
}): JSX.Element {
  const { number } = useFormatters()

  return (
    <section aria-labelledby="focus-heading" className="flex flex-col gap-4">
      <Heading id="focus-heading" level={2} size="3">
        {messages.heading}
      </Heading>
      <Card className="gap-6 p-6">
        <div className="flex items-start gap-4">
          <LanguageBadge tag={deck.learningLanguage} size="lg" />
          <div className="flex min-w-0 flex-col gap-1">
            <Heading level={3} size="3" className="text-pretty wrap-break-word">
              {deck.title}
            </Heading>
            <LastStudied at={deck.lastReviewedAt} now={now} />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:max-w-xs">
          <div className="flex flex-col-reverse gap-1">
            <dt className="text-sm text-muted-foreground">{messages.due}</dt>
            <dd className="font-heading text-3xl font-bold tabular-nums">
              {number(deck.dueCount)}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-1">
            <dt className="text-sm text-muted-foreground">
              {messages.newToday}
            </dt>
            <dd className="font-heading text-3xl font-bold tabular-nums">
              {number(deck.newAvailable)}
            </dd>
          </div>
        </dl>
        <MasteryBar deck={deck} />
        {/* The Today panel above holds this course's study button. */}
        {deckAction(deck) === null ? (
          <Text variant="muted">{messages.caughtUp}</Text>
        ) : null}
      </Card>
    </section>
  )
}
