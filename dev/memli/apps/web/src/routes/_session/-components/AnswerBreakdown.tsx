import type { JSX, ReactNode } from "react"
import type { StudyCard } from "./study-cards"

const messages = {
  region: "Answer",
  meaning: "Meaning",
  // Read before the phonetic guide by screen readers only.
  pronunciation: "Pronunciation: ",
  example: "Example",
} as const

type AnswerBreakdownProps = {
  card: StudyCard
  /** BCP 47 tag of the term and example sentence. */
  learningLanguage: string
  /** BCP 47 tag of the meaning and example translation. */
  answerLanguage: string
  /** How a typed answer compared, shown first. Absent when revealed without typing. */
  verdict?: ReactNode
  /** Shown after the meaning and example, still inside the answer: the mnemonic (#50). */
  children?: ReactNode
}

/**
 * Focuses the answer when it appears, so keyboard and screen-reader users
 * land on it instead of on the page body (the reveal button is gone). A
 * module-level function keeps the ref stable, so it runs once per mount.
 */
function focusOnMount(element: HTMLElement | null): void {
  element?.focus()
}

/** The revealed side of a study card: what it means, how it sounds, and an example. */
export function AnswerBreakdown({
  card,
  learningLanguage,
  answerLanguage,
  verdict,
  children,
}: AnswerBreakdownProps): JSX.Element {
  return (
    <section
      ref={focusOnMount}
      tabIndex={-1}
      aria-label={messages.region}
      className="flex animate-in flex-col gap-4 duration-300 outline-none fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
    >
      {verdict}
      {/* One card with two parts on phones; two cards side by side from sm up. */}
      <div className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent">
        <div className="flex flex-col gap-2 p-6 sm:rounded-xl sm:border sm:border-border sm:bg-card">
          <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {messages.meaning}
          </h2>
          <p
            lang={answerLanguage}
            className="font-heading text-3xl font-bold tracking-tight wrap-break-word text-primary"
          >
            {card.answers[0]}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="sr-only">{messages.pronunciation}</span>
            {card.phonetic}
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-border bg-muted/40 p-6 sm:rounded-xl sm:border">
          <h2 className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {messages.example}
          </h2>
          <p lang={learningLanguage} className="text-lg italic">
            {card.example.text}
          </p>
          <p lang={answerLanguage} className="text-sm text-muted-foreground">
            {card.example.translation}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}
