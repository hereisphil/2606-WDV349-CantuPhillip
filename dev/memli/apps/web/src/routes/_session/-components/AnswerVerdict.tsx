import type { JSX } from "react"
import { CircleAlert, CircleCheck, CircleX } from "lucide-react"
import type { Evaluation } from "@workspace/core/answer/evaluate"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"

const messages = {
  exact: "Correct!",
  accent: "Almost! Check the accents.",
  typo: "So close! Just a typo.",
  wrong: "Not quite",
  // One template so translators can move the answer within the sentence.
  youAnswered: "You answered <answer>{answer}</answer>",
} as const

// Solid container tints, not alpha tints whose contrast shifts with what's behind them.
// Text is 9:1 or better in both themes; borders are 3:1 or better against tint and page.
const tones = {
  success: {
    box: "border-success bg-success-container",
    text: "text-success-container-foreground",
    Icon: CircleCheck,
  },
  warning: {
    box: "border-warning bg-warning-container",
    text: "text-warning-container-foreground",
    Icon: CircleAlert,
  },
  wrong: {
    box: "border-destructive bg-destructive-container",
    text: "text-destructive-container-foreground",
    Icon: CircleX,
  },
} as const

function verdictOf(evaluation: Evaluation): {
  title: string
  tone: keyof typeof tones
} {
  switch (evaluation.verdict) {
    case "exact":
      return { title: messages.exact, tone: "success" }
    case "near":
      return {
        title: evaluation.reason === "accent" ? messages.accent : messages.typo,
        tone: "warning",
      }
    case "wrong":
      return { title: messages.wrong, tone: "wrong" }
  }
}

type AnswerVerdictProps = {
  evaluation: Evaluation
  /** What the learner typed. */
  answer: string
  /** BCP 47 tag of `answer`. */
  answerLanguage: string
}

/**
 * How a typed answer compared, from `@workspace/core`'s Evaluator. Color is
 * never the only signal: each verdict has its own icon and words.
 */
export function AnswerVerdict({
  evaluation,
  answer,
  answerLanguage,
}: AnswerVerdictProps): JSX.Element {
  const { rich } = useFormatters()
  const { title, tone } = verdictOf(evaluation)
  const { box, text, Icon } = tones[tone]

  return (
    <div
      className={cn("flex items-start gap-3 rounded-xl border px-5 py-4", box)}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-5 shrink-0", text)} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className={cn("font-semibold", text)}>{title}</p>
        <p className={cn("text-sm", text)}>
          {rich(
            messages.youAnswered,
            {
              // Tags are matched in the template before `answer` is filled in, so typed "<…>" stays plain text.
              answer: (text) => (
                <span
                  lang={answerLanguage}
                  className="font-medium wrap-break-word text-foreground"
                >
                  {text}
                </span>
              ),
            },
            { answer }
          )}
        </p>
      </div>
    </div>
  )
}
