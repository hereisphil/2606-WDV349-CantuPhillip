import type { JSX } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

type StudyMode = "review" | "learn"

// Placeholder destination for dashboard actions. #48 builds the session layout.
export const Route = createFileRoute("/_app/study/$courseId")({
  validateSearch: (search: Record<string, unknown>): { mode: StudyMode } => ({
    mode: search.mode === "learn" ? "learn" : "review",
  }),
  component: StudySessionPlaceholder,
})

function StudySessionPlaceholder(): JSX.Element {
  const { courseId } = Route.useParams()
  const { mode } = Route.useSearch()

  return (
    <Section
      width="full"
      padding="compact"
      className="flex flex-col items-start gap-4"
    >
      <Heading>Study session</Heading>
      <Text variant="muted">
        The {mode === "learn" ? "learn-new-words" : "review"} session for{" "}
        <span className="font-medium text-foreground">{courseId}</span> arrives
        with #48.
      </Text>
      <Button render={<Link to="/dashboard" />} nativeButton={false}>
        Back to dashboard
      </Button>
    </Section>
  )
}
