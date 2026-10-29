import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/terms")({
  component: Terms,
})

function Terms(): JSX.Element {
  return (
    <Section>
      <Heading>Terms of Service</Heading>
      <Text variant="muted" className="mt-4">
        Our terms of service are being finalized. Check back soon.
      </Text>
    </Section>
  )
}
