import { useCallback, type JSX } from "react"
import { AnswerForm } from "./AnswerForm"
import { RevealButton } from "./RevealButton"
import { useActiveTime } from "./use-active-time"

type PromptActionsProps = {
  /** BCP 47 tag the learner types in. */
  answerLanguage: string
  onSubmit: (answer: string, elapsedMs: number | null) => void
  onReveal: (elapsedMs: number | null) => void
}

/**
 * The two ways past a prompt: type an answer, or reveal it. Mount one per
 * card (keyed by card id) so the response timer starts with that card.
 */
export function PromptActions({
  answerLanguage,
  onSubmit,
  onReveal,
}: PromptActionsProps): JSX.Element {
  const elapsedMs = useActiveTime()
  // Stable, so the Space shortcut listener isn't re-added on every keystroke.
  const reveal = useCallback(() => {
    onReveal(elapsedMs())
  }, [onReveal, elapsedMs])

  return (
    <>
      <AnswerForm
        answerLanguage={answerLanguage}
        onSubmit={(answer) => {
          onSubmit(answer, elapsedMs())
        }}
      />
      <RevealButton onReveal={reveal} />
    </>
  )
}
