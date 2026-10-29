import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { useViewer } from "@/components/session-provider"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()

  return (
    <Section width="full" padding="compact">
      <Heading>Dashboard</Heading>
      <Text variant="muted" className="mt-2">
        {viewer.displayName}
      </Text>
    </Section>
  )
}
