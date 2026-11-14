import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Check } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck } from "./dashboard-metrics"
import {
  deckTotal,
  startedCount,
  type KeepGoing,
  type TodayState,
} from "./dashboard-model"
import { LanguageBadge } from "./LanguageBadge"

const messages = {
  review: {
    count: {
      one: "<n>{count}</n> word to review",
      other: "<n>{count}</n> words to review",
    },
    duration: "About {duration}",
    start: "Start review",
    startLabel: {
      one: "Start review, {count} word in {course}",
      other: "Start review, {count} words in {course}",
    },
    learnNew: {
      one: "Learn {count} new word",
      other: "Learn {count} new words",
    },
    learnNewLabel: {
      one: "Learn {count} new word in {course}",
      other: "Learn {count} new words in {course}",
    },
  },
  learn: {
    count: {
      one: "<n>{count}</n> new word to learn",
      other: "<n>{count}</n> new words to learn",
    },
    nothingToReview: "Nothing to review right now.",
    start: "Start learning",
    startLabel: {
      one: "Start learning, {count} new word in {course}",
      other: "Start learning, {count} new words in {course}",
    },
  },
  done: {
    heading: "All done for today",
    detail: "Nothing to review right now. Check back later.",
    keepGoing: "Want to keep going?",
    learnMore: {
      one: "Learn {count} more new word",
      other: "Learn {count} more new words",
    },
    learnMoreCost: "Each new word means a few short reviews later.",
    practice: {
      one: "Practice {count} tricky word",
      other: "Practice {count} tricky words",
    },
    findAnother: "Find another course",
  },
  empty: {
    heading: "Pick your first course",
    detail: "Courses are word lists with memory tricks from other learners.",
    find: "Find a course",
  },
  progress: {
    one: "{started} of {count} word started",
    other: "{started} of {count} words started",
  },
} as const

const headingId = "study-hero-heading"

// The hero sizes itself by its own width (a container query), so a landscape
// phone and a desktop column get the same layout at the same width.
const actionsClass = "flex flex-col gap-3 @min-[520px]:flex-row"
const mainButtonClass = cn(
  buttonVariants({ variant: "cta", size: "touch-xl" }),
  "w-full @min-[520px]:w-auto @min-[520px]:min-w-70"
)
const quietButtonClass = cn(
  buttonVariants({ variant: "hero-quiet", size: "touch-lg" }),
  "w-full @min-[520px]:w-auto"
)
// 24 px on phones, 30 px from 640 px: the greeting's size, for states with no number.
const headlineClass =
  "font-heading text-2xl font-bold text-pretty text-hero-foreground sm:text-3xl"
const mutedClass = "text-lg text-hero-muted-foreground"
// Text stays at a readable width (480 px). Buttons may use the full row. The
// free space on the end side is kept for mnemonic pictures later.
const textBlockClass = "flex max-w-120 flex-col gap-1"

function CourseHeading({ deck }: { deck: DashboardDeck }): JSX.Element {
  return (
    <div className="flex max-w-120 items-center gap-3">
      <LanguageBadge tag={deck.learningLanguage} size="lg" tone="hero" />
      <h2
        id={headingId}
        className="min-w-0 font-heading text-lg font-semibold text-pretty wrap-break-word"
      >
        {deck.title}
      </h2>
    </div>
  )
}

/** "16" on a line of its own at 56 or 72 px, then its phrase. One sentence for translators. */
function BigCount({
  count,
  message,
}: {
  count: number
  message: { one: string; other: string }
}): JSX.Element {
  const { rich } = useFormatters()

  return (
    <p className="text-xl font-semibold">
      {rich(
        message,
        {
          n: (text) => (
            <span className="block font-heading text-[3.5rem] leading-none font-bold tracking-tight tabular-nums @min-[520px]:text-7xl">
              {text}
            </span>
          ),
        },
        { count }
      )}
    </p>
  )
}

/** One fill for the words started. The sentence carries the numbers, so the bar is hidden from screen readers. */
function CourseProgress({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { plural } = useFormatters()
  const total = deckTotal(deck)
  const started = startedCount(deck)
  const share = total > 0 ? (started / total) * 100 : 0

  return (
    <div className="flex max-w-120 flex-col gap-2">
      <div
        aria-hidden="true"
        className="h-2 overflow-hidden rounded-full bg-hero-chip"
      >
        <div
          className="h-full rounded-full bg-hero-foreground"
          style={{ width: `${share}%` }}
        />
      </div>
      <p className="text-base text-hero-muted-foreground tabular-nums">
        {plural(total, messages.progress, { started })}
      </p>
    </div>
  )
}

function ReviewContent({
  state,
}: {
  state: Extract<TodayState, { status: "review" }>
}): JSX.Element {
  const { format, plural, duration } = useFormatters()
  const { dueCount, minutes, focusDeck: deck } = state

  return (
    <>
      <div className={textBlockClass}>
        <BigCount count={dueCount} message={messages.review.count} />
        <p className={mutedClass}>
          {format(messages.review.duration, { duration: duration(minutes) })}
        </p>
      </div>
      <div className={actionsClass}>
        <Link
          to="/study/$courseId"
          params={{ courseId: deck.courseId }}
          search={{ mode: "review" }}
          aria-label={plural(dueCount, messages.review.startLabel, {
            course: deck.title,
          })}
          className={mainButtonClass}
        >
          {messages.review.start}
        </Link>
        {deck.newAvailable > 0 ? (
          <Link
            to="/study/$courseId"
            params={{ courseId: deck.courseId }}
            search={{ mode: "learn" }}
            aria-label={plural(
              deck.newAvailable,
              messages.review.learnNewLabel,
              { course: deck.title }
            )}
            className={quietButtonClass}
          >
            {plural(deck.newAvailable, messages.review.learnNew)}
          </Link>
        ) : null}
      </div>
    </>
  )
}

function LearnContent({ deck }: { deck: DashboardDeck }): JSX.Element {
  const { plural } = useFormatters()

  return (
    <>
      <div className={textBlockClass}>
        <BigCount count={deck.newAvailable} message={messages.learn.count} />
        <p className={mutedClass}>{messages.learn.nothingToReview}</p>
      </div>
      <div className={actionsClass}>
        <Link
          to="/study/$courseId"
          params={{ courseId: deck.courseId }}
          search={{ mode: "learn" }}
          aria-label={plural(deck.newAvailable, messages.learn.startLabel, {
            course: deck.title,
          })}
          className={mainButtonClass}
        >
          {messages.learn.start}
        </Link>
      </div>
    </>
  )
}

function KeepGoingActions({
  keepGoing,
}: {
  keepGoing: KeepGoing
}): JSX.Element {
  const { plural } = useFormatters()
  const { deck, extraNew, trickyCount } = keepGoing

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-120 font-semibold">{messages.done.keepGoing}</p>
      <div className={actionsClass}>
        {extraNew > 0 ? (
          <Link
            to="/study/$courseId"
            params={{ courseId: deck.courseId }}
            search={{ mode: "learn", extra: extraNew }}
            className={quietButtonClass}
          >
            {plural(extraNew, messages.done.learnMore)}
          </Link>
        ) : null}
        {trickyCount > 0 ? (
          <Link
            to="/study/$courseId"
            params={{ courseId: deck.courseId }}
            search={{ mode: "practice" }}
            className={quietButtonClass}
          >
            {plural(trickyCount, messages.done.practice)}
          </Link>
        ) : null}
      </div>
      {extraNew > 0 ? (
        <p className="max-w-120 text-base text-hero-muted-foreground">
          {messages.done.learnMoreCost}
        </p>
      ) : null}
    </div>
  )
}

/** No amber button on purpose: when everything is done, the right next step is to stop. */
function DoneContent({
  keepGoing,
}: {
  keepGoing: KeepGoing | null
}): JSX.Element {
  return (
    <>
      <div className="flex flex-col gap-3">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-hero-chip"
        >
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <div className={textBlockClass}>
          <p className={headlineClass}>{messages.done.heading}</p>
          <p className={mutedClass}>{messages.done.detail}</p>
        </div>
      </div>
      {keepGoing === null ? (
        <div className={actionsClass}>
          <Link to="/community" className={quietButtonClass}>
            {messages.done.findAnother}
          </Link>
        </div>
      ) : (
        <KeepGoingActions keepGoing={keepGoing} />
      )}
    </>
  )
}

function EmptyContent(): JSX.Element {
  return (
    <>
      <div className={cn(textBlockClass, "gap-2")}>
        <h2 id={headingId} className={headlineClass}>
          {messages.empty.heading}
        </h2>
        <p className={mutedClass}>{messages.empty.detail}</p>
      </div>
      <div className={actionsClass}>
        <Link to="/community" className={mainButtonClass}>
          {messages.empty.find}
        </Link>
      </div>
    </>
  )
}

function HeroFrame({ children }: { children: ReactNode }): JSX.Element {
  return (
    <section
      aria-labelledby={headingId}
      // --ring is reset so focus outlines inside the navy panel use its own white ring.
      className="@container rounded-2xl border border-transparent bg-hero text-hero-foreground shadow-(--hero-shadow) [--ring:var(--hero-ring)] dark:border-hero-border"
    >
      <div className="flex flex-col gap-6 p-5 @min-[520px]:p-8">{children}</div>
    </section>
  )
}

/** The one thing to do today: the focus course, its count and its button. */
export function StudyHero({ state }: { state: TodayState }): JSX.Element {
  switch (state.status) {
    case "no-decks":
      return (
        <HeroFrame>
          <EmptyContent />
        </HeroFrame>
      )
    case "review":
      return (
        <HeroFrame>
          <CourseHeading deck={state.focusDeck} />
          <ReviewContent state={state} />
          <CourseProgress deck={state.focusDeck} />
        </HeroFrame>
      )
    case "learn":
      return (
        <HeroFrame>
          <CourseHeading deck={state.deck} />
          <LearnContent deck={state.deck} />
          <CourseProgress deck={state.deck} />
        </HeroFrame>
      )
    case "caught-up":
      return (
        <HeroFrame>
          <CourseHeading deck={state.deck} />
          <DoneContent keepGoing={state.keepGoing} />
          <CourseProgress deck={state.deck} />
        </HeroFrame>
      )
  }
}
