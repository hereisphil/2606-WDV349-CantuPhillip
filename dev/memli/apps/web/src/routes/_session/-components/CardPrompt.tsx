import { useState, type JSX } from "react"
import { Volume2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import { canPronounce, pronounce } from "./pronunciation"
import type { StudyMode } from "./session-model"
import type { StudyCard } from "./study-cards"

const messages = {
  mode: {
    review: "Review",
    learn: "Learn new words",
    practice: "Practice tricky words",
  },
  instruction: "What does this mean in {language}?",
  partOfSpeech: {
    noun: "Noun",
    verb: "Verb",
    adjective: "Adjective",
    adverb: "Adverb",
    phrase: "Phrase",
  },
  gender: {
    masculine: "Masculine",
    feminine: "Feminine",
    neuter: "Neuter",
  },
  grammarWithGender: "{partOfSpeech} · {gender}",
  pronounce: "Play pronunciation",
} as const

type CardPromptProps = {
  card: StudyCard
  mode: StudyMode
  /** BCP 47 tag of `card.term`. */
  learningLanguage: string
  /** BCP 47 tag the learner answers in. */
  answerLanguage: string
  /** Once the answer shows, the instruction to recall it goes away. */
  revealed: boolean
}

/**
 * The top of a study card: the word or phrase to recall, its part of speech,
 * and a button to hear it. It stays on screen above the answer once revealed.
 */
export function CardPrompt({
  card,
  mode,
  learningLanguage,
  answerLanguage,
  revealed,
}: CardPromptProps): JSX.Element {
  const { format, languageName } = useFormatters()
  const partOfSpeech = messages.partOfSpeech[card.partOfSpeech]
  const grammar =
    card.gender === undefined
      ? partOfSpeech
      : format(messages.grammarWithGender, {
          partOfSpeech,
          gender: messages.gender[card.gender],
        })

  return (
    <section
      aria-labelledby="session-mode"
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6 sm:min-h-72 sm:gap-6 sm:p-8",
        // On phones the card tightens once revealed, so the answer sits right under the term.
        revealed ? "gap-2" : "min-h-72 gap-6"
      )}
    >
      <p
        id="session-mode"
        className="self-end text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        {messages.mode[mode]}
      </p>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        {revealed ? null : (
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {format(messages.instruction, {
              language: languageName(answerLanguage),
            })}
          </p>
        )}
        {/* `lang` so screen readers and speech pick the right voice for the term. */}
        <p
          lang={learningLanguage}
          className="font-heading text-4xl font-bold tracking-tight text-balance break-words sm:text-6xl"
        >
          {card.term}
        </p>
        <p className="text-sm text-muted-foreground">{grammar}</p>
        {canPronounce ? (
          // Keyed so a new card starts with a fresh button, never a leftover spinner.
          <PronounceButton
            key={card.cardId}
            text={card.term}
            lang={learningLanguage}
          />
        ) : null}
      </div>
    </section>
  )
}

/** The spinner stays at least this long so it reads as feedback, not a flicker. */
const MIN_LOADING_MS = 1000

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Plays the term. The speaker icon turns into a spinner until the audio
 * starts, for at least {@link MIN_LOADING_MS}.
 */
function PronounceButton({
  text,
  lang,
}: {
  text: string
  /** BCP 47 tag of `text`. */
  lang: string
}): JSX.Element {
  // One uncoupled boolean, so `useState` (docs/state-management.md).
  const [isStarting, setIsStarting] = useState(false)

  async function play(): Promise<void> {
    setIsStarting(true)
    await Promise.all([pronounce(text, lang), wait(MIN_LOADING_MS)])
    setIsStarting(false)
  }

  return (
    <Button
      variant="secondary"
      size="icon-lg"
      className="size-11 rounded-full"
      aria-label={messages.pronounce}
      // Not `disabled`: that would drop keyboard focus mid-press. Repeat presses are ignored instead.
      aria-busy={isStarting}
      onClick={() => {
        if (!isStarting) {
          void play()
        }
      }}
    >
      {/* Keyed so each icon remounts and plays the quick fade-in when they swap. */}
      <span
        key={isStarting ? "loading" : "ready"}
        className="flex animate-in duration-200 zoom-in-75 fade-in motion-reduce:animate-none"
      >
        {isStarting ? (
          <Spinner className="size-5" />
        ) : (
          <Volume2 aria-hidden="true" className="size-5" />
        )}
      </span>
    </Button>
  )
}
