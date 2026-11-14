import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Heading } from "@workspace/ui/components/heading"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck } from "./dashboard-metrics"
import { deckAction, masteredRatio, type DeckAction } from "./dashboard-model"
import { LanguageBadge } from "./LanguageBadge"
import { LastStudied } from "./LastStudied"

const messages = {
  heading: "Your other courses",
  due: { one: "{count} to review", other: "{count} to review" },
  new: { one: "{count} new", other: "{count} new" },
  caughtUp: "All done",
  mastered: "{percent} learned",
  review: "Review",
  reviewLabel: {
    one: "Review {count} word in {course}",
    other: "Review {count} words in {course}",
  },
  learn: "Learn",
  learnLabel: {
    one: "Learn {count} new word in {course}",
    other: "Learn {count} new words in {course}",
  },
} as const

const actionMessages = {
  review: { text: messages.review, label: messages.reviewLabel },
  learn: { text: messages.learn, label: messages.learnLabel },
} as const

function StatusChip({ action }: { action: DeckAction | null }): JSX.Element {
  const { plural } = useFormatters()

  if (action === null) {
    return <Badge variant="outline">{messages.caughtUp}</Badge>
  }
  return action.mode === "review" ? (
    <Badge className="tabular-nums">{plural(action.count, messages.due)}</Badge>
  ) : (
    <Badge variant="secondary" className="tabular-nums">
      {plural(action.count, messages.new)}
    </Badge>
  )
}

function MiniProgress({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { format, percent } = useFormatters()
  const ratio = masteredRatio(deck)

  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden="true"
        className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-chart-1"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {format(messages.mastered, { percent: percent(ratio) })}
      </span>
    </div>
  )
}

function RowAction({
  deck,
  action,
}: {
  deck: DashboardDeck
  action: DeckAction
}): JSX.Element {
  const { plural } = useFormatters()
  const { text, label } = actionMessages[action.mode]

  return (
    <Link
      to="/study/$courseId"
      params={{ courseId: action.courseId }}
      search={{ mode: action.mode }}
      aria-label={plural(action.count, label, { course: deck.title })}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "px-3 @2xl:justify-self-end"
      )}
    >
      {text}
    </Link>
  )
}

function DeckRow({
  deck,
  now,
}: {
  deck: DashboardDeck
  now: Date
}): JSX.Element {
  const action = deckAction(deck)

  return (
    <li className="flex flex-col gap-3 p-4 @2xl:col-span-4 @2xl:grid @2xl:grid-cols-subgrid @2xl:items-center @2xl:gap-x-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <LanguageBadge tag={deck.learningLanguage} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <Heading
            level={3}
            size="4"
            weight="semibold"
            className="text-base text-pretty wrap-break-word"
          >
            {deck.title}
          </Heading>
          <LastStudied at={deck.lastReviewedAt} now={now} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 ps-11 @2xl:contents">
        <StatusChip action={action} />
        <MiniProgress deck={deck} />
        {action === null ? null : <RowAction deck={deck} action={action} />}
      </div>
    </li>
  )
}

/** Decks other than the focus deck, most in need first. Renders nothing when empty. */
export function DeckList({
  decks,
  now,
}: {
  decks: readonly DashboardDeck[]
  now: Date
}): JSX.Element | null {
  if (decks.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="decks-heading"
      className="@container flex flex-col gap-4"
    >
      <Heading id="decks-heading" level={2} size="3">
        {messages.heading}
      </Heading>
      <ul className="divide-y rounded-xl bg-card ring-1 ring-foreground/10 @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] @2xl:gap-x-4">
        {decks.map((deck) => (
          <DeckRow key={deck.courseId} deck={deck} now={now} />
        ))}
      </ul>
    </section>
  )
}
