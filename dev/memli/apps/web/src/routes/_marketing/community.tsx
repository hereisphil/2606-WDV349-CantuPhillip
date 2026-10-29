import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/community")({
  component: Community,
})

function Community(): JSX.Element {
  return (
    <Section>
      <Heading>Community</Heading>
      <Text variant="muted" className="mt-4">
        Connect with other learners and explore shared memory hooks. This page
        is coming soon.
      </Text>
    </Section>
  )
}
