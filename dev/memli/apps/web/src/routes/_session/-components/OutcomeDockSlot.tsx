/* eslint-disable memli/no-literal-ui-strings -- development-only placeholder, never shown to learners */
import type { JSX } from "react"
import type { Evaluation } from "@workspace/core/answer/evaluate"
import { outcomeChoices, type ReviewOutcome } from "@workspace/core/srs/outcome"
import type { CardProgress } from "@workspace/core/srs/progress"
import { suggestOutcome } from "@workspace/core/study/timing"
import { Button } from "@workspace/ui/components/button"
import { DevSlot } from "./DevSlot"

type OutcomeDockSlotProps = {
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
 * Where the Session Outcome Dock (#51) goes: after the revealed answer.
 * The contract is already real: the choices come from `outcomeChoices`, the
 * pre-highlight from `suggestOutcome`, and `onResolve` sends RESOLVE to the
 * session reducer. #51 replaces this body with learner-friendly labels,
 * keyboard support and focus handling; the props stay.
 *
 * In development the raw outcome codes are buttons, so a whole session can
 * be stepped through before #51 lands.
 */
export function OutcomeDockSlot({
  evaluation,
  elapsedMs,
  progress,
  onResolve,
}: OutcomeDockSlotProps): JSX.Element | null {
  if (!import.meta.env.DEV) {
    return null
  }
  const choices = outcomeChoices(evaluation)
  const suggested = suggestOutcome({ evaluation, elapsedMs, progress })

  return (
    <DevSlot name="Outcome dock" issue="#51">
      <div className="flex flex-wrap gap-2">
        {choices.map((outcome) => (
          <Button
            key={outcome}
            size="sm"
            variant={outcome === suggested ? "default" : "outline"}
            className="font-mono"
            onClick={() => {
              onResolve(outcome)
            }}
          >
            {outcome}
          </Button>
        ))}
      </div>
      <p>
        Choices from outcomeChoices; filled button = suggestOutcome (
        {suggested ?? "none"}). Response time:{" "}
        {elapsedMs === null ? "unknown" : `${String(Math.round(elapsedMs))} ms`}
        .
      </p>
    </DevSlot>
  )
}
