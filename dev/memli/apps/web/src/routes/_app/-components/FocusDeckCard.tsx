import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck } from "./dashboard-metrics"
import { deckAction, type DeckAction } from "./dashboard-model"

const messages = {
  heading: "Continue learning",
  lastStudied: "Last studied {time}",
  notStarted: "Not started yet",
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
  review: {
    one: "Review {count} card",
    other: "Review {count} cards",
  },
  reviewLabel: {
    one: "Review {count} card in {deck}",
    other: "Review {count} cards in {deck}",
  },
  learn: {
    one: "Learn {count} new word",
    other: "Learn {count} new words",
  },
  learnLabel: {
    one: "Learn {count} new word in {deck}",
    other: "Learn {count} new words in {deck}",
  },
  caughtUp: "Nothing due in this deck. New reviews arrive as you need them.",
} as const

const segments = [
  { key: "mastered", className: "bg-chart-1" },
  { key: "learning", className: "bg-chart-2" },
  { key: "unseen", className: "bg-chart-4" },
] as const

function languageCode(tag: string): string {
  return new Intl.Locale(tag).language.toUpperCase()
}

function MasteryBar({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { percent, plural, format } = useFormatters()
  const counts = {
    mastered: deck.masteredCount,
    learning: deck.learningCount,
    unseen: deck.unseenCount,
  }
  const total = counts.mastered + counts.learning + counts.unseen

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-heading text-lg font-semibold tabular-nums">
          {format(messages.mastered, {
            percent: percent(total > 0 ? counts.mastered / total : 0),
          })}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {plural(total, messages.totalCards)}
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

const actionMessages = {
  review: { text: messages.review, label: messages.reviewLabel },
  learn: { text: messages.learn, label: messages.learnLabel },
} as const

function ActionLink({
  deck,
  action,
}: {
  deck: DashboardDeck
  action: DeckAction
}): JSX.Element {
  const { plural } = useFormatters()
  const { text, label } = actionMessages[action.mode]

  return (
    <Button
      variant="outline"
      className="h-11 self-start px-4 text-base"
      aria-label={plural(action.count, label, { deck: deck.title })}
      render={
        <Link
          to="/study/$courseId"
          params={{ courseId: action.courseId }}
          search={{ mode: action.mode }}
        />
      }
      nativeButton={false}
    >
      {plural(action.count, text)}
    </Button>
  )
}

export function FocusDeckCard({
  deck,
  now,
  showAction,
}: {
  deck: DashboardDeck
  now: Date
  /** False when the Today panel's primary action already leads to the same session. */
  showAction: boolean
}): JSX.Element {
  const { number, format, languageName, relativeTime } = useFormatters()
  const language = languageName(deck.learningLanguage)
  const action = deckAction(deck)

  return (
    <section aria-labelledby="focus-heading" className="flex flex-col gap-4">
      <Heading id="focus-heading" level={2} size="3">
        {messages.heading}
      </Heading>
      <Card className="gap-6 p-6">
        <div className="flex items-start gap-4">
          <Badge
            variant="secondary"
            title={language}
            className="h-10 min-w-10 rounded-lg px-2 text-sm font-semibold"
          >
            <span aria-hidden="true">
              {languageCode(deck.learningLanguage)}
            </span>
            <span className="sr-only">{language}</span>
          </Badge>
          <div className="flex min-w-0 flex-col gap-1">
            <Heading level={3} size="3" className="text-pretty">
              {deck.title}
            </Heading>
            <Text variant="small">
              {deck.lastReviewedAt === null
                ? messages.notStarted
                : format(messages.lastStudied, {
                    time: relativeTime(new Date(deck.lastReviewedAt), now),
                  })}
            </Text>
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
        {action === null ? (
          <Text variant="muted">{messages.caughtUp}</Text>
        ) : showAction ? (
          <ActionLink deck={deck} action={action} />
        ) : null}
      </Card>
    </section>
  )
}
