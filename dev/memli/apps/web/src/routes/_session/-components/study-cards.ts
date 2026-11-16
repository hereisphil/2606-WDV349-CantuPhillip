import { createProgress } from "@workspace/core/srs/progress"
import type { StudyCardData } from "@workspace/schemas/api/study"
import type { Card } from "@workspace/schemas/content/card"

/**
 * Card shapes for a study session. They come from `@workspace/schemas`, the
 * contract `GET /api/courses/:courseId/study` answers with (#112).
 */
export type {
  Mnemonic,
  MnemonicStoryPart,
} from "@workspace/schemas/content/mnemonic"

/** A card's content, as the study screens use it. */
export type StudyCard = Card

/**
 * A card with the viewer's progress on it: what the API sends, and what
 * `@workspace/core`'s session reducer schedules.
 */
export type SessionStudyCard = StudyCardData

/**
 * Gives cards with no progress a brand-new one. Only dev previews need it:
 * their fixture cards are not in the database, so the API never sent them.
 */
export function withNewProgress(
  cards: readonly StudyCard[],
  now: Date
): SessionStudyCard[] {
  return cards.map((card) => ({
    ...card,
    progress: createProgress(card.cardId, now),
  }))
}
