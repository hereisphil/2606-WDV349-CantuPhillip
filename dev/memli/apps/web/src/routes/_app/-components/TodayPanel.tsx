import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck } from "./dashboard-metrics"
import type { KeepGoing, TodayState } from "./dashboard-model"

const messages = {
  heading: "Today",
  dueLabel: {
    one: "card ready to review",
    other: "cards ready to review",
  },
  duration: "About {duration}",
  fromDeck: "{count} from {deck}",
  moreDecks: {
    one: "and {count} more deck",
    other: "and {count} more decks",
  },
  startReview: "Start review",
  learnNew: {
    one: "Learn {count} new word",
    other: "Learn {count} new words",
  },
  startsIn: "Starts in {deck}.",
  nothingDue: "Nothing to review right now",
  newReady: {
    one: "{count} new word is ready in {deck}.",
    other: "{count} new words are ready in {deck}.",
  },
  caughtUp: "You're all caught up",
  caughtUpDetail:
    "New reviews show up here as your memory needs them. Check back later today.",
  keepGoing: "Want to keep going in {deck}?",
  learnMore: {
    one: "Learn {count} more new word",
    other: "Learn {count} more new words",
  },
  learnMoreCost:
    "Each new word adds a few short reviews over the coming weeks.",
  practiceTricky: {
    one: "Practice {count} tricky word",
    other: "Practice {count} tricky words",
  },
  noDecks: "You don't have any decks yet",
  noDecksDetail: "Find a deck to start building your vocabulary.",
  browseCommunity: "Browse community decks",
} as const

const primaryActionClass = "h-11 px-4 text-base"

const MAX_LISTED_DECKS = 3

function LearnLink({
  deck,
  variant,
}: {
  deck: DashboardDeck
  variant: "default" | "outline"
}): JSX.Element {
  const { plural } = useFormatters()

  return (
    <Button
      variant={variant}
      className={primaryActionClass}
      render={
        <Link
          to="/study/$courseId"
          params={{ courseId: deck.courseId }}
          search={{ mode: "learn" }}
        />
      }
      nativeButton={false}
    >
      {plural(deck.newAvailable, messages.learnNew)}
    </Button>
  )
}

function Actions({ children }: { children: ReactNode }): JSX.Element {
  return <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
}

function ReviewContent({
  state,
}: {
  state: Extract<TodayState, { status: "review" }>
}): JSX.Element {
  const { number, format, plural, duration } = useFormatters()
  const { dueCount, minutes, dueDecks, focusDeck } = state
  const spansDecks = dueDecks.length > 1
  const listedDecks = dueDecks.slice(0, MAX_LISTED_DECKS)
  const unlistedDecks = dueDecks.length - listedDecks.length

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-heading text-5xl font-bold tracking-tight tabular-nums">
            {number(dueCount)}
          </span>{" "}
          <span className="text-lg font-medium">
            {plural(dueCount, messages.dueLabel)}
          </span>
        </p>
        <Text variant="muted">
          {format(messages.duration, { duration: duration(minutes) })}
        </Text>
      </div>
      {spansDecks ? (
        <ul className="flex flex-wrap items-center gap-2">
          {listedDecks.map((deck) => (
            <li
              key={deck.courseId}
              className="max-w-full rounded-lg bg-card px-3 py-1 text-sm wrap-break-word text-muted-foreground tabular-nums"
            >
              {format(messages.fromDeck, {
                count: deck.dueCount,
                deck: deck.title,
              })}
            </li>
          ))}
          {unlistedDecks > 0 ? (
            <li className="text-sm text-muted-foreground">
              {plural(unlistedDecks, messages.moreDecks)}
            </li>
          ) : null}
        </ul>
      ) : null}
      <div className="flex flex-col gap-2">
        <Actions>
          <Button
            className={primaryActionClass}
            render={
              <Link
                to="/study/$courseId"
                params={{ courseId: focusDeck.courseId }}
                search={{ mode: "review" }}
              />
            }
            nativeButton={false}
          >
            {messages.startReview}
          </Button>
          {focusDeck.newAvailable > 0 ? (
            <LearnLink deck={focusDeck} variant="outline" />
          ) : null}
        </Actions>
        {spansDecks ? (
          <Text variant="small">
            {format(messages.startsIn, { deck: focusDeck.title })}
          </Text>
        ) : null}
      </div>
    </>
  )
}

function LearnContent({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { plural } = useFormatters()

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-2xl font-bold">{messages.nothingDue}</p>
        <Text variant="muted">
          {plural(deck.newAvailable, messages.newReady, { deck: deck.title })}
        </Text>
      </div>
      <Actions>
        <LearnLink deck={deck} variant="default" />
      </Actions>
    </>
  )
}

function KeepGoingActions({
  keepGoing,
}: {
  keepGoing: KeepGoing
}): JSX.Element {
  const { format, plural } = useFormatters()
  const { deck, extraNew, trickyCount } = keepGoing

  return (
    <div className="flex flex-col gap-3 border-t border-foreground/10 pt-5">
      <p className="font-medium wrap-break-word">
        {format(messages.keepGoing, { deck: deck.title })}
      </p>
      <Actions>
        {extraNew > 0 ? (
          <Button
            variant="outline"
            className={primaryActionClass}
            render={
              <Link
                to="/study/$courseId"
                params={{ courseId: deck.courseId }}
                search={{ mode: "learn", extra: extraNew }}
              />
            }
            nativeButton={false}
          >
            {plural(extraNew, messages.learnMore)}
          </Button>
        ) : null}
        {trickyCount > 0 ? (
          <Button
            variant="outline"
            className={primaryActionClass}
            render={
              <Link
                to="/study/$courseId"
                params={{ courseId: deck.courseId }}
                search={{ mode: "practice" }}
              />
            }
            nativeButton={false}
          >
            {plural(trickyCount, messages.practiceTricky)}
          </Button>
        ) : null}
      </Actions>
      {extraNew > 0 ? (
        <Text variant="small">{messages.learnMoreCost}</Text>
      ) : null}
    </div>
  )
}

function CaughtUpContent({
  keepGoing,
}: {
  keepGoing: KeepGoing | null
}): JSX.Element {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-2xl font-bold">{messages.caughtUp}</p>
        <Text variant="muted">{messages.caughtUpDetail}</Text>
      </div>
      {keepGoing === null ? null : <KeepGoingActions keepGoing={keepGoing} />}
    </>
  )
}

function NoDecksContent(): JSX.Element {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-2xl font-bold">{messages.noDecks}</p>
        <Text variant="muted">{messages.noDecksDetail}</Text>
      </div>
      <Actions>
        <Button
          className={primaryActionClass}
          render={<Link to="/community" />}
          nativeButton={false}
        >
          {messages.browseCommunity}
        </Button>
      </Actions>
    </>
  )
}

function PanelContent({ state }: { state: TodayState }): JSX.Element {
  switch (state.status) {
    case "review":
      return <ReviewContent state={state} />
    case "learn":
      return <LearnContent deck={state.deck} />
    case "caught-up":
      return <CaughtUpContent keepGoing={state.keepGoing} />
    case "no-decks":
      return <NoDecksContent />
  }
}

export function TodayPanel({ state }: { state: TodayState }): JSX.Element {
  return (
    <section
      aria-labelledby="today-heading"
      className="flex flex-col gap-5 rounded-xl bg-accent p-6"
    >
      <Heading
        id="today-heading"
        level={2}
        size="4"
        weight="semibold"
        className="text-sm tracking-wide text-accent-foreground uppercase"
      >
        {messages.heading}
      </Heading>
      <PanelContent state={state} />
    </section>
  )
}
