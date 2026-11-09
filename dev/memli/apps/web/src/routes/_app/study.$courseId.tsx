import type { JSX } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"

type StudyMode = "review" | "learn" | "practice"

type StudySearch = {
  mode: StudyMode
  /** New cards to add past today's limit. Only meaningful with `mode: "learn"`. */
  extra?: number | undefined
}

const messages = {
  heading: "Study session",
  placeholder: {
    review: "The review session for <b>{course}</b> arrives with #48.",
    learn: "The learn-new-words session for <b>{course}</b> arrives with #48.",
    practice:
      "The tricky-words practice session for <b>{course}</b> arrives with #48.",
  },
  learnExtra: {
    one: "The learn-new-words session with {count} extra new card for <b>{course}</b> arrives with #48.",
    other:
      "The learn-new-words session with {count} extra new cards for <b>{course}</b> arrives with #48.",
  },
  back: "Back to dashboard",
} as const

const richTags = {
  b: (chunk: string) => (
    <span className="font-medium text-foreground">{chunk}</span>
  ),
}

function parseMode(value: unknown): StudyMode {
  return value === "learn" || value === "practice" ? value : "review"
}

function parseExtra(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : undefined
}

// Placeholder destination for dashboard actions. #48 builds the session layout.
export const Route = createFileRoute("/_app/study/$courseId")({
  // `extra` is always set, even to undefined, because the router merges raw params into this result.
  validateSearch: (search: Record<string, unknown>): StudySearch => {
    const mode = parseMode(search.mode)
    return {
      mode,
      extra: mode === "learn" ? parseExtra(search.extra) : undefined,
    }
  },
  component: StudySessionPlaceholder,
})

function StudySessionPlaceholder(): JSX.Element {
  const { courseId } = Route.useParams()
  const { mode, extra } = Route.useSearch()
  const { rich } = useFormatters()

  return (
    <Section
      width="full"
      padding="compact"
      className="flex flex-col items-start gap-4"
    >
      <Heading>{messages.heading}</Heading>
      <Text variant="muted">
        {extra === undefined
          ? rich(messages.placeholder[mode], richTags, { course: courseId })
          : rich(messages.learnExtra, richTags, {
              count: extra,
              course: courseId,
            })}
      </Text>
      <Button render={<Link to="/dashboard" />} nativeButton={false}>
        {messages.back}
      </Button>
    </Section>
  )
}
