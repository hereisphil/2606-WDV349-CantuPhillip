import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"

/** Where learners send reports, takedown notices and questions (#170). */
const legalEmail = "hello@phillipcantu.com"

/** A paragraph, or a bulleted list. Both may use the tags in `richTags`. */
type LegalBlock = string | { list: readonly string[] }

export type LegalSection = {
  /** The heading's anchor, so a section can be linked: `/terms#copyright`. */
  id: string
  title: string
  body: readonly LegalBlock[]
}

const messages = {
  updated: "Last updated {date}",
  onThisPage: "On this page",
} as const

const inlineLink =
  "font-semibold wrap-break-word text-link underline underline-offset-4"

type RichTags = Record<string, (chunk: string) => ReactNode>

/**
 * Tags every legal message may use: `<strong>` leads a paragraph, `<email>`
 * mails `legalEmail`, and `<terms>`, `<privacy>` and `<conduct>` link pages.
 */
const legalTags: RichTags = {
  strong: (chunk: string): ReactNode => (
    <strong className="font-semibold text-foreground-strong">{chunk}</strong>
  ),
  email: (chunk: string): ReactNode => (
    <a href={`mailto:${legalEmail}`} className={inlineLink}>
      {chunk}
    </a>
  ),
  terms: (chunk: string): ReactNode => (
    <Link to="/terms" className={inlineLink}>
      {chunk}
    </Link>
  ),
  privacy: (chunk: string): ReactNode => (
    <Link to="/privacy" className={inlineLink}>
      {chunk}
    </Link>
  ),
  conduct: (chunk: string): ReactNode => (
    <Link to="/code-of-conduct" className={inlineLink}>
      {chunk}
    </Link>
  ),
}

/**
 * The frame of the legal pages: title, date, contents, sections.
 * Plain content with no app state, so it can move to static HTML (#178).
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
  tags,
}: {
  title: string
  /** "YYYY-MM-DD" of the last change that matters to a learner. */
  updated: string
  intro: readonly string[]
  sections: readonly LegalSection[]
  /** More tags for this page's messages, like `<es>` for a Spanish word. */
  tags?: RichTags
}): JSX.Element {
  const { calendarDate, format, rich } = useFormatters()
  const richTags = { ...legalTags, ...tags }

  return (
    <Section width="narrow" className="py-12 sm:py-16">
      <Heading className="text-3xl sm:text-4xl">{title}</Heading>
      <Text variant="muted" className="mt-3 text-base">
        <time dateTime={updated}>
          {format(messages.updated, { date: calendarDate(updated) })}
        </time>
      </Text>

      <div className="mt-8 space-y-4">
        {intro.map((paragraph) => (
          <Text key={paragraph} className="text-lg leading-8">
            {rich(paragraph, richTags, { email: legalEmail })}
          </Text>
        ))}
      </div>

      <nav
        aria-labelledby="legal-contents"
        className="@container mt-10 rounded-xl border bg-card p-5 sm:p-6"
      >
        <Heading
          level={2}
          id="legal-contents"
          size="4"
          weight="semibold"
          className="text-foreground-strong"
        >
          {messages.onThisPage}
        </Heading>
        <ol className="mt-2 grid gap-x-6 @[34rem]:grid-cols-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="inline-flex min-h-11 items-center text-base text-link underline-offset-4 hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 space-y-12">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            {/* The contents link here, so clear the sticky header. */}
            <Heading
              level={2}
              id={section.id}
              size="2"
              weight="semibold"
              className="scroll-mt-(--marketing-header-clearance)"
            >
              {section.title}
            </Heading>
            <div className="mt-4 space-y-4">
              {section.body.map((block) =>
                typeof block === "string" ? (
                  <Text key={block}>
                    {rich(block, richTags, { email: legalEmail })}
                  </Text>
                ) : (
                  <ul
                    key={block.list.join()}
                    className="list-disc space-y-2 ps-6 text-base leading-7 marker:text-muted-foreground"
                  >
                    {block.list.map((item) => (
                      <li key={item}>
                        {rich(item, richTags, { email: legalEmail })}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </Section>
  )
}
