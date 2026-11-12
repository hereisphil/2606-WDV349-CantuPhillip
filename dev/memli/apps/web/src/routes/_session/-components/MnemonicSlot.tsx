/* eslint-disable memli/no-literal-ui-strings -- development-only placeholder, never shown to learners */
import type { JSX } from "react"
import { DevSlot } from "./DevSlot"
import type { StudyCard } from "./study-cards"

type MnemonicSlotProps = {
  card: StudyCard
  /** BCP 47 tag of the term the mnemonic anchors. */
  learningLanguage: string
  /** BCP 47 tag of the mnemonic's story. */
  answerLanguage: string
}

/**
 * Where the Mnemonic Caption Overlay Frame (#50) goes: inside the revealed
 * answer, under the meaning and example, for the card on screen. #50 adds
 * the mnemonic fields to `StudyCard` (or loads them with #112) and replaces
 * this body; the props and position stay.
 */
export function MnemonicSlot({
  card,
  learningLanguage,
}: MnemonicSlotProps): JSX.Element | null {
  if (!import.meta.env.DEV) {
    return null
  }
  return (
    <DevSlot name="Mnemonic" issue="#50">
      <p>
        Image, association story and community mnemonics for{" "}
        <span lang={learningLanguage} className="font-medium text-foreground">
          {card.term}
        </span>
        .
      </p>
    </DevSlot>
  )
}
