import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  return (
    <Section width="full" padding="compact">
      <Heading>Decks</Heading>
      <Text variant="muted" className="mt-2">
        Your vocabulary collections will show up here.
      </Text>
    </Section>
  )
}
