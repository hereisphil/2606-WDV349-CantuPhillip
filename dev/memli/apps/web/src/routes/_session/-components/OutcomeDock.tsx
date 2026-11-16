import { useEffect, useId, useMemo, useState, type JSX } from "react"
import type { Evaluation } from "@workspace/core/answer/evaluate"
import {
  outcomeChoices,
  previewOutcomeDue,
  type ReviewOutcome,
} from "@workspace/core/srs/outcome"
import type { CardProgress } from "@workspace/core/srs/progress"
import { suggestOutcome } from "@workspace/core/study/timing"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"

type OutcomeLabels = Readonly<Partial<Record<ReviewOutcome, string>>>

const messages = {
  // Names the choices for screen readers when no question is shown.
  label: "How did it go?",
  question: "Did you know it?",
  missedHint: "You'll see this word again in this session.",
  enterKey: "Enter",
  // Under each choice: when the word comes back. `time` is "in 5 days", "in 14 hours"…
  due: "Back {time}",
  // A missed word goes to the end of this session's queue, whatever FSRS says.
  dueThisSession: "Back later this session",
  // Read between a choice and its due time, so it isn't run together ("Got it Back in…").
  dueSeparator: ", ",
  // First-person answers to "Did you know it?", never grade names (Forgot, Hard…).
  revealed: {
    missed: "No, I didn't",
    tough: "I think so",
    got_it: "Yes, I knew it",
    easy: "Yes, easily",
  },
  exact: {
    got_it: "Got it",
    easy: "That was easy",
  },
  typo: {
    tough: "No, I wasn't sure",
    got_it: "Yes, just a typo",
  },
  accent: {
    tough: "No, I wasn't sure",
    got_it: "Yes, just the accents",
  },
  wrong: {
    missed: "Continue",
  },
} as const satisfies Record<string, string | OutcomeLabels>

/** Left to right (start to end), the way a scale reads. Keys 1 to 4 follow it. */
const RANK = {
  missed: 0,
  tough: 1,
  got_it: 2,
  easy: 3,
} as const satisfies Record<ReviewOutcome, number>

type DockCopy = {
  /** Names the choices for screen readers. */
  label: string
  /** Whether `label` is also shown. Not when the verdict above already sets it up. */
  showLabel: boolean
  /** One line of what happens next. */
  hint: string | null
  labels: OutcomeLabels
}

function copyOf(evaluation: Evaluation | null): DockCopy {
  if (evaluation === null) {
    // No verdict above, so the question is what makes the choices make sense.
    return {
      label: messages.question,
      showLabel: true,
      hint: null,
      labels: messages.revealed,
    }
  }
  switch (evaluation.verdict) {
    case "exact":
      return {
        label: messages.label,
        showLabel: false,
        hint: null,
        labels: messages.exact,
      }
    case "near":
      // "So close! Just a typo." above already asks it, so the phone keeps the room for the meaning.
      return {
        label: messages.question,
        showLabel: false,
        hint: null,
        labels:
          evaluation.reason === "accent" ? messages.accent : messages.typo,
      }
    case "wrong":
      return {
        label: messages.label,
        showLabel: false,
        hint: messages.missedHint,
        labels: messages.wrong,
      }
  }
}

/**
 * Enter's choice (the amber button): the timing nudge, else "got it" when correct (never "easy", ~54 days out on FSRS-7),
 * else "missed" when wrong or revealed, so it comes back this session. A near miss has none: only the learner knows.
 */
function primaryOf(
  evaluation: Evaluation | null,
  suggested: ReviewOutcome | null
): ReviewOutcome | null {
  if (suggested !== null) {
    return suggested
  }
  if (evaluation === null) {
    return "missed"
  }
  if (evaluation.verdict === "near") {
    return null
  }
  return outcomeChoices(evaluation)[0] ?? null
}

/** Enter and Space already act on these when they have focus. */
const interactive =
  "a[href], button, input, textarea, select, summary, [role='button'], [contenteditable='true']"
/** Digits type into these. */
const typing = "input, textarea, select, [contenteditable='true']"

/**
 * Enter confirms the default choice, and 1 to 4 pick a choice by position.
 * A focused control keeps Enter, so the mnemonic's arrows still work.
 */
function useOutcomeKeys(
  choices: readonly ReviewOutcome[],
  primary: ReviewOutcome | null,
  onResolve: (outcome: ReviewOutcome) => void
): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        // Holding Enter down after submitting must not also settle the card.
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return
      }
      const target = event.target instanceof Element ? event.target : null

      if (event.key === "Enter") {
        if (primary === null || target?.closest(interactive)) {
          return
        }
        event.preventDefault()
        onResolve(primary)
        return
      }

      const outcome = /^[1-9]$/.test(event.key)
        ? choices[Number(event.key) - 1]
        : undefined
      if (outcome === undefined || target?.closest(typing)) {
        return
      }
      event.preventDefault()
      onResolve(outcome)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [choices, primary, onResolve])
}

type OutcomeDockProps = {
  /** `null` when the answer was revealed without typing. */
  evaluation: Evaluation | null
  /** Capped response time from the session, for the timing nudge. */
  elapsedMs: number | null
  /** The card's progress before this review. */
  progress: CardProgress
  /** Settles the card: the session moves to the next one, or completes. */
  onResolve: (outcome: ReviewOutcome) => void
}

/**
 * Session Outcome Dock (#51), sticky so the next step is in reach without scrolling past the mnemonic.
 * `outcomeChoices` never asks what the answer settled: a wrong answer gets one button, a correct one two.
 */
export function OutcomeDock({
  evaluation,
  elapsedMs,
  progress,
  onResolve,
}: OutcomeDockProps): JSX.Element {
  const labelId = useId()
  const hintId = useId()
  const { format, relativeTime } = useFormatters()
  // When the dock opened, so the due times don't shift while the learner decides.
  const [openedAt] = useState(() => new Date())
  const { label, showLabel, hint, labels } = copyOf(evaluation)
  const choices = useMemo(
    () => [...outcomeChoices(evaluation)].sort((a, b) => RANK[a] - RANK[b]),
    [evaluation]
  )
  const primary = primaryOf(
    evaluation,
    suggestOutcome({ evaluation, elapsedMs, progress })
  )
  useOutcomeKeys(choices, primary, onResolve)

  // A dock with a hint already says when the word comes back.
  const dueOf = useMemo((): Record<ReviewOutcome, string> | null => {
    if (hint !== null) {
      return null
    }
    const due = previewOutcomeDue(progress, openedAt)
    const back = (outcome: ReviewOutcome): string =>
      format(messages.due, {
        time: relativeTime(new Date(due[outcome]), openedAt),
      })
    return {
      missed: messages.dueThisSession,
      tough: back("tough"),
      got_it: back("got_it"),
      easy: back("easy"),
    }
  }, [hint, progress, openedAt, format, relativeTime])

  return (
    <div
      role="group"
      aria-label={showLabel ? undefined : label}
      aria-labelledby={showLabel ? labelId : undefined}
      aria-describedby={hint === null ? undefined : hintId}
      className={cn(
        "sticky bottom-0 z-10 animate-in border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] duration-300 fade-in slide-in-from-bottom-4 motion-reduce:animate-none sm:px-6 sm:pt-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]",
        // The root's bottom scroll padding keeps focused and scrolled-to content out from under the dock (WCAG 2.4.11).
        // Measured: one row of choices is 81 to 115 px tall, two rows 163 to 179 px, or up to 223 px once the due times show.
        choices.length > 2
          ? "[:root:has(&)]:scroll-pb-48 [@media(min-height:45rem)]:[:root:has(&)]:scroll-pb-60"
          : "[:root:has(&)]:scroll-pb-32"
      )}
    >
      {/* One choice sits beside its hint, so the dock stays one row tall on a phone. */}
      <div
        className={cn(
          "mx-auto flex w-full max-w-xl gap-2 sm:gap-3",
          choices.length === 1 ? "items-center gap-4" : "flex-col"
        )}
      >
        {showLabel ? (
          <p id={labelId} className="font-semibold text-foreground">
            {label}
          </p>
        ) : null}
        {hint === null ? null : (
          <p id={hintId} className="flex-1 text-muted-foreground">
            {hint}
          </p>
        )}
        <div
          className={cn(
            "grid gap-2 sm:gap-3",
            choices.length > 1 ? "grid-cols-2" : "ms-auto max-w-1/2"
          )}
        >
          {choices.map((outcome, index) => {
            const isPrimary = outcome === primary
            const digit = String(index + 1)
            const due = dueOf?.[outcome] ?? null
            return (
              <Button
                key={outcome}
                variant={isPrimary ? "cta" : "outline"}
                size={isPrimary ? "touch-xl" : "touch-lg"}
                // One size for every label, so a row of two reads as a pair.
                className={cn(
                  "relative flex-col gap-0 rounded-xl px-3 text-base font-semibold sm:px-5",
                  !isPrimary && "shadow-sm"
                )}
                aria-keyshortcuts={isPrimary ? `Enter ${digit}` : digit}
                onClick={() => {
                  onResolve(outcome)
                }}
              >
                {/* The name is all the visible text ("Got it, back in 5 days"), so voice control and WCAG 2.5.3 match what is on screen. */}
                <span>{labels[outcome] ?? messages.revealed[outcome]}</span>
                {due === null ? null : (
                  <>
                    <span className="sr-only">{messages.dueSeparator}</span>
                    <span
                      // Shown only on screens tall enough to keep the meaning in view above the dock. Screen readers always hear it.
                      className="sr-only text-sm font-semibold [@media(min-height:45rem)]:not-sr-only"
                    >
                      {due}
                    </span>
                  </>
                )}
                {/* Shortcut hint only on hover or keyboard focus, and only with a mouse or trackpad. Absolutely placed so the label never shifts. */}
                <kbd
                  aria-hidden="true"
                  className="pointer-events-none absolute end-3 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-sm font-medium text-muted-foreground opacity-0 transition-opacity group-hover/button:opacity-100 group-focus-visible/button:opacity-100 motion-reduce:transition-none pointer-fine:block"
                >
                  {isPrimary ? messages.enterKey : digit}
                </kbd>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
