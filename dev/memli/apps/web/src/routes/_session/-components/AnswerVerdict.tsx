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

// Text mixes the tone toward --foreground: darker in light mode, lighter in dark, so it
// clears 4.5:1 on its own /10 tint in both themes (checked by e2e/study.a11y.spec.ts).
const tones = {
  success: {
    box: "border-success/30 bg-success/10",
    text: "text-[color-mix(in_oklab,var(--success)_70%,var(--foreground))]",
    Icon: CircleCheck,
  },
  warning: {
    box: "border-warning/30 bg-warning/10",
    text: "text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]",
    Icon: CircleAlert,
  },
  wrong: {
    box: "border-destructive/30 bg-destructive/10",
    text: "text-[color-mix(in_oklab,var(--destructive)_70%,var(--foreground))]",
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
        <p className="text-sm text-muted-foreground">
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
