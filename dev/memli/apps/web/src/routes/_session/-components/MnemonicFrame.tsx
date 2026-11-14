import { useId, type JSX } from "react"
import { ThumbsUp } from "lucide-react"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import { MnemonicImage } from "./MnemonicImage"
import type { MnemonicStoryPart, StudyCard } from "./study-cards"

const messages = {
  heading: "Community mnemonic",
  byline: "By {author}",
  // Only when the story isn't in the deck's answer language.
  bylineWithLanguage: "By {author}, written in {language}",
} as const

type MnemonicFrameProps = {
  card: StudyCard
  /** BCP 47 tag of the term the mnemonic anchors. */
  learningLanguage: string
  /** BCP 47 tag of the deck's meanings, to tell when a story is in another language. */
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
  const { format, languageName } = useFormatters()
  const mnemonic = card.mnemonics?.[0]
  if (mnemonic === undefined) {
    return null
  }

  const { contentLocale, author } = mnemonic
  // Compare languages, not tags: "en" and "en-US" read the same.
  const sameLanguage =
    new Intl.Locale(contentLocale).language ===
    new Intl.Locale(answerLanguage).language
  const byline = sameLanguage
    ? format(messages.byline, { author: author.displayName })
    : format(messages.bylineWithLanguage, {
        author: author.displayName,
        language: languageName(contentLocale),
      })

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <Heading
        level={2}
        weight="medium"
        id={headingId}
        className="flex items-center gap-2 font-sans text-xs tracking-widest text-muted-foreground uppercase"
      >
        <ThumbsUp aria-hidden="true" className="size-3.5" />
        {messages.heading}
      </Heading>
      {/* Picture above the story on phones; picture and story share the width from sm up. */}
      <div className="grid gap-4 sm:grid-cols-2 sm:items-center sm:gap-6">
        <MnemonicImage
          key={mnemonic.mnemonicId}
          image={mnemonic.image}
          term={card.term}
          learningLanguage={learningLanguage}
          imageLanguage={contentLocale}
          className="mx-auto max-w-xs sm:max-w-none"
        />
        <figure className="flex min-w-0 flex-col gap-3">
          <blockquote lang={contentLocale}>
            <Text className="text-lg leading-8 wrap-break-word">
              {mnemonic.story.map((part, index) => (
                // Parts never reorder, so their position is a stable key.
                <StoryPart
                  key={index}
                  part={part}
                  learningLanguage={learningLanguage}
                />
              ))}
            </Text>
          </blockquote>
          <figcaption>
            <Text variant="small" className="wrap-break-word">
              {byline}
            </Text>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function StoryPart({
  part,
  learningLanguage,
}: {
  part: MnemonicStoryPart
  learningLanguage: string
}): JSX.Element {
  switch (part.kind) {
    case "term":
      return (
        <strong lang={learningLanguage} className="font-semibold text-primary">
          {part.text}
        </strong>
      )
    case "keyword":
      // A highlighter stroke: the sound-alike hook is the part to remember.
      return (
        <mark className="rounded-sm bg-cta/45 box-decoration-clone px-1 font-medium text-foreground dark:bg-cta/15 dark:text-cta">
          {part.text}
        </mark>
      )
    case "plain":
      return <>{part.text}</>
  }
}
