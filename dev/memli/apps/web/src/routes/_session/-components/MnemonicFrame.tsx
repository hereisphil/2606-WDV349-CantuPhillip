import { useId, useState, type JSX } from "react"
import { ArrowBigUp, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import { MnemonicImage } from "./MnemonicImage"
import type { MnemonicStoryPart, StudyCard } from "./study-cards"

const messages = {
  heading: "Community mnemonic",
  byline: "By <author>{author}</author>",
  // Only when the story isn't in the course's answer language.
  bylineWithLanguage: "By <author>{author}</author>, written in {language}",
  // The author deleted their account; the story stays.
  writtenIn: "Written in {language}",
  upvotes: { one: "{count} upvote", other: "{count} upvotes" },
  position: "{current} of {total}",
  // Read first when the story changes, so a screen reader hears where it is.
  positionAnnounced: "Mnemonic {current} of {total}.",
  previous: "Previous mnemonic",
  next: "Next mnemonic",
} as const

type MnemonicFrameProps = {
  card: StudyCard
  /** BCP 47 tag of the term the mnemonic anchors. */
  learningLanguage: string
  /** BCP 47 tag of the course's meanings, to tell when a story is in another language. */
  answerLanguage: string
}

/**
 * Mnemonic Caption Overlay Frame (#50, `05 - Study session answer page.png`): opens on the most upvoted, arrows wrap.
 * The answer remounts for every card, so the position starts over each time.
 */
export function MnemonicFrame({
  card,
  learningLanguage,
  answerLanguage,
}: MnemonicFrameProps): JSX.Element | null {
  const headingId = useId()
  const { format, plural, rich, languageName } = useFormatters()
  const [index, setIndex] = useState(0)
  const mnemonics = card.mnemonics ?? []
  const total = mnemonics.length
  const mnemonic = mnemonics[index]
  if (mnemonic === undefined) {
    return null
  }

  const step = (by: 1 | -1): void => {
    setIndex((current) => (current + by + total) % total)
  }
  const position = { current: index + 1, total }

  const { contentLocale, author } = mnemonic
  // Compare languages, not tags: "en" and "en-US" read the same.
  const sameLanguage =
    new Intl.Locale(contentLocale).language ===
    new Intl.Locale(answerLanguage).language
  const language = languageName(contentLocale)
  // The author's name stands out from "By"; the upvotes beside it are a quieter stat.
  // A story whose author deleted their account has no name to show.
  const byline =
    author === null
      ? sameLanguage
        ? null
        : format(messages.writtenIn, { language })
      : rich(
          sameLanguage ? messages.byline : messages.bylineWithLanguage,
          {
            author: (name) => (
              <span className="font-medium text-foreground">{name}</span>
            ),
          },
          { author: author.displayName, language }
        )

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Heading
          level={2}
          weight="semibold"
          id={headingId}
          className="flex items-center gap-2 font-sans text-sm text-foreground"
        >
          <ThumbsUp aria-hidden="true" className="size-4" />
          {messages.heading}
        </Heading>
        {total > 1 ? (
          <MnemonicNav
            position={position}
            onStep={step}
            layout="header"
            className="hidden sm:flex"
          />
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:items-center sm:gap-6">
        <MnemonicImage
          // Keyed so a new picture starts loading from scratch.
          key={mnemonic.mnemonicId}
          image={mnemonic.image}
          term={card.term}
          learningLanguage={learningLanguage}
          imageLanguage={contentLocale}
          className="mx-auto max-w-xs sm:max-w-none"
        />
        {/* Announces the new story after an arrow press; nothing is read on first render. */}
        <figure
          aria-live="polite"
          aria-atomic="true"
          className="flex min-w-0 flex-col gap-3"
        >
          {total > 1 ? (
            <span className="sr-only">
              {format(messages.positionAnnounced, position)}
            </span>
          ) : null}
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
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {byline !== null ? (
              <Text variant="small" className="min-w-0 wrap-break-word">
                {byline}
              </Text>
            ) : null}
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground tabular-nums">
              <ArrowBigUp aria-hidden="true" className="size-3.5" />
              {plural(mnemonic.upvotes, messages.upvotes)}
            </span>
          </figcaption>
        </figure>
      </div>
      {total > 1 ? (
        // Phones: below the story, within thumb reach. The header row has no room for 44 px buttons.
        <MnemonicNav
          position={position}
          onStep={step}
          layout="bar"
          className="flex justify-between border-t border-border pt-4 sm:hidden"
        />
      ) : null}
    </section>
  )
}

/**
 * Rendered once per layout and hidden with CSS in the other, so only one is in the accessibility tree.
 * Each layout writes its parts in visual order, so nothing is reordered with CSS.
 */
function MnemonicNav({
  position,
  onStep,
  layout,
  className,
}: {
  position: { current: number; total: number }
  onStep: (by: 1 | -1) => void
  /** `header`: position, then both arrows. `bar`: the position between the arrows. */
  layout: "header" | "bar"
  className: string
}): JSX.Element {
  const { format } = useFormatters()
  const previous = (
    <Button
      variant="outline"
      size="icon-touch"
      aria-label={messages.previous}
      onClick={() => {
        onStep(-1)
      }}
    >
      <ChevronLeft aria-hidden="true" />
    </Button>
  )
  // The figure's live region says the position for screen readers.
  const count = (
    <span
      aria-hidden="true"
      className="text-sm font-semibold text-foreground tabular-nums"
    >
      {format(messages.position, position)}
    </span>
  )
  return (
    <div className={cn("items-center gap-2", className)}>
      {layout === "header" ? count : previous}
      {layout === "header" ? previous : count}
      <Button
        variant="outline"
        size="icon-touch"
        aria-label={messages.next}
        onClick={() => {
          onStep(1)
        }}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
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
        <strong lang={learningLanguage} className="font-semibold text-emphasis">
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
