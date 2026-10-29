import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
})

function Settings(): JSX.Element {
  return (
    <Section width="full" padding="compact">
      <Heading>Settings</Heading>
      <Text variant="muted" className="mt-2">
        Learning preferences and account email will live here.
      </Text>
    </Section>
  )
}
