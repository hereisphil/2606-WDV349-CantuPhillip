import type { JSX } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

type StudyMode = "review" | "learn" | "practice"

type StudySearch = {
  mode: StudyMode
  /** New cards to add past today's limit. Only meaningful with `mode: "learn"`. */
  extra?: number | undefined
}

const sessionNames = {
  review: "review",
  learn: "learn-new-words",
  practice: "tricky-words practice",
} as const satisfies Record<StudyMode, string>

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

  return (
    <Section
      width="full"
      padding="compact"
      className="flex flex-col items-start gap-4"
    >
      <Heading>Study session</Heading>
      <Text variant="muted">
        The {sessionNames[mode]} session
        {extra === undefined ? null : ` (${extra} extra new cards)`} for{" "}
        <span className="font-medium text-foreground">{courseId}</span> arrives
        with #48.
      </Text>
      <Button render={<Link to="/dashboard" />} nativeButton={false}>
        Back to dashboard
      </Button>
    </Section>
  )
}
