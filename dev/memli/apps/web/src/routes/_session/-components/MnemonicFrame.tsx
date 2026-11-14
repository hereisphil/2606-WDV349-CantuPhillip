import { useId, type JSX } from "react"
import { ThumbsUp } from "lucide-react"
import { DevSlot } from "./DevSlot"
import { MnemonicImage } from "./MnemonicImage"
import type { StudyCard } from "./study-cards"

const messages = {
  heading: "Community mnemonic",
} as const

type MnemonicFrameProps = {
  card: StudyCard
  /** BCP 47 tag of the term the mnemonic anchors. */
  learningLanguage: string
  /** BCP 47 tag of the mnemonic's story and image description. */
  answerLanguage: string
}

/**
 * The Mnemonic Caption Overlay Frame (#50): the card's memory hook, inside
 * the revealed answer under the meaning and example
 * (`05 - Study session answer page.png`). Shows nothing when the card has
 * no mnemonic yet.
 */
export function MnemonicFrame({
  card,
  learningLanguage,
  answerLanguage,
}: MnemonicFrameProps): JSX.Element | null {
  const headingId = useId()
  const mnemonic = card.mnemonics?.[0]
  if (mnemonic === undefined) {
    return null
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <h2
        id={headingId}
        className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase"
      >
        <ThumbsUp aria-hidden="true" className="size-3.5" />
        {messages.heading}
      </h2>
      {/* Picture above the story on phones; beside it from sm up. */}
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr] sm:items-center sm:gap-6">
        <MnemonicImage
          key={mnemonic.mnemonicId}
          image={mnemonic.image}
          term={card.term}
          learningLanguage={learningLanguage}
          answerLanguage={answerLanguage}
          className="mx-auto max-w-xs sm:max-w-none"
        />
        {import.meta.env.DEV ? (
          <DevSlot name="Mnemonic story" issue="#50" />
        ) : null}
      </div>
    </section>
  )
}
