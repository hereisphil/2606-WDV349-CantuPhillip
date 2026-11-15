import { useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, RotateCcw } from "lucide-react"
import type { SessionReview } from "@workspace/core/study/session-reducer"
import { summarizeSession } from "@workspace/core/study/summary"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import { MnemonicImage } from "./MnemonicImage"
import type { SessionStudyCard } from "./study-cards"

const messages = {
  heading: "All done!",
  body: {
    one: "You finished the {count} word in this session.",
    other: "You finished all {count} words in this session.",
  },
  // `time` is "in 14 hours", "in 5 days"…
  nextReview: "Your next review is {time}.",
  stats: "Session results",
  words: { one: "word studied", other: "words studied" },
  remembered: "remembered the first time",
  minutes: { one: "minute studied", other: "minutes studied" },
  back: "Back to dashboard",
  again: "Study these words again",
} as const

type SessionSummaryProps = {
  finished: readonly SessionStudyCard[]
  reviews: readonly SessionReview[]
  /** Time on screen this visit, hidden-tab time left out (`useActiveTime`). */
  activeMs: () => number | null
  /** BCP 47 tag of the terms. */
  learningLanguage: string
  /** Sends RESTART: the same words, from the top. */
  onRestart: () => void
}

/**
 * Takes focus when it appears, so keyboard and screen-reader users land on
 * the result, not the page body (the dock button they pressed is gone).
 */
function focusOnMount(element: HTMLElement | null): void {
  element?.focus()
}

/** The end of a session (`07 - Study session final page.png`): what got done, and what's next. */
export function SessionSummary({
  finished,
  reviews,
  activeMs,
  learningLanguage,
  onRestart,
}: SessionSummaryProps): JSX.Element {
  const { number, percent, plural, format, relativeTime } = useFormatters()
  const { words, rememberedFirstTime, nextDue } = summarizeSession(
    finished,
    reviews
  )
  // Read once, when the session ends, so the numbers hold still.
  const [endedAt] = useState(() => ({
    at: new Date(),
    minutes: Math.max(1, Math.round((activeMs() ?? 0) / 60_000)),
  }))
  // A word from this session with a picture: a reminder of the memory hooks just used.
  const pictured = finished.find((card) =>
    card.mnemonics?.some((mnemonic) => mnemonic.image !== undefined)
  )
  const picture = pictured?.mnemonics?.find(
    (mnemonic) => mnemonic.image !== undefined
  )

  const stats = [
    { value: number(words), label: plural(words, messages.words) },
    {
      value: percent(words === 0 ? 0 : rememberedFirstTime / words),
      label: messages.remembered,
    },
    {
      value: number(endedAt.minutes),
      label: plural(endedAt.minutes, messages.minutes),
    },
  ]

  return (
    // Built for a 375 px phone first: the result, the main action, then the way to go again, all on the first screen.
    <div className="flex flex-col gap-4 sm:gap-6">
      <section
        ref={focusOnMount}
        tabIndex={-1}
        aria-labelledby="session-summary-heading"
        className="flex animate-in flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center duration-300 outline-none fade-in slide-in-from-bottom-2 motion-reduce:animate-none sm:gap-4 sm:p-8"
      >
        {pictured !== undefined && picture !== undefined ? (
          <MnemonicImage
            image={picture.image}
            term={pictured.term}
            learningLanguage={learningLanguage}
            imageLanguage={picture.contentLocale}
            className="w-28 rounded-xl sm:w-40"
          />
        ) : null}
        <Heading id="session-summary-heading" level={2} size="1">
          {messages.heading}
        </Heading>
        <div className="flex flex-col gap-1">
          <Text variant="muted">{plural(words, messages.body)}</Text>
          {nextDue === null ? null : (
            <Text variant="muted">
              {format(messages.nextReview, {
                time: relativeTime(new Date(nextDue), endedAt.at),
              })}
            </Text>
          )}
        </div>
        {/* One row of three on every width, divided by rules, so the phone keeps its buttons on screen. */}
        <ul
          aria-label={messages.stats}
          className="mt-1 grid w-full grid-cols-3 divide-x divide-border border-t border-border pt-4 sm:mt-2 sm:pt-6"
        >
          {stats.map(({ value, label }) => (
            <li key={label} className="flex flex-col items-center gap-1 px-2">
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground tabular-nums sm:text-3xl">
                {value}
              </span>
              <span className="text-sm font-semibold text-balance text-foreground">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* The main action first in reading order: on a phone it sits right under the result. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/dashboard"
          className={cn(
            buttonVariants({ variant: "cta", size: "touch-xl" }),
            "rounded-xl text-base"
          )}
        >
          <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
          {messages.back}
        </Link>
        <Button
          variant="outline"
          size="touch-xl"
          className="rounded-xl bg-card text-base font-semibold shadow-sm"
          onClick={onRestart}
        >
          <RotateCcw aria-hidden="true" />
          {messages.again}
        </Button>
      </div>
    </div>
  )
}
