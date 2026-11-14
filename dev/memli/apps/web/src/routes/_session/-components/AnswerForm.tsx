import { useId, useState, type JSX } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { useFormatters } from "@/lib/formatters"

const messages = {
  label: "Your answer",
  // Short enough for a phone next to Submit; the card already asks for the meaning.
  placeholder: "Type in {language}…",
  submit: "Submit",
  hint: "Press Enter to submit",
} as const

type AnswerFormProps = {
  /** BCP 47 tag the learner types in. */
  answerLanguage: string
  /** Called with the trimmed answer; never with a blank one. */
  onSubmit: (answer: string) => void
}

/** Where the learner types what the term means. Checked by `@workspace/core`'s Evaluator. */
export function AnswerForm({
  answerLanguage,
  onSubmit,
}: AnswerFormProps): JSX.Element {
  const { format, languageName } = useFormatters()
  const inputId = useId()
  const hintId = useId()
  // One controlled input, so `useState` (docs/state-management.md).
  const [value, setValue] = useState("")
  const answer = value.trim()

  return (
    <form
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault()
        if (answer !== "") {
          onSubmit(answer)
        }
      }}
    >
      <label
        htmlFor={inputId}
        className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        {messages.label}
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          // `lang` sets the spell-check and keyboard language for what the learner types.
          lang={answerLanguage}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={format(messages.placeholder, {
            language: languageName(answerLanguage),
          })}
          aria-describedby={hintId}
          // Autocorrect would "fix" the very mistakes the Evaluator should see.
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="done"
          className="h-12 rounded-lg px-3.5 text-base md:text-base"
        />
        {/* Disabled while blank, which also stops Enter from submitting nothing. */}
        <Button
          type="submit"
          disabled={answer === ""}
          className="h-12 shrink-0 gap-2 rounded-lg px-4 text-base font-semibold sm:px-5"
        >
          {messages.submit}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {/* Only shown with a mouse or trackpad: touch keyboards have their own submit key. Still read to screen readers. */}
      <p
        id={hintId}
        className="hidden text-xs text-muted-foreground pointer-fine:block"
      >
        {messages.hint}
      </p>
    </form>
  )
}
