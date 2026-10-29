import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/pricing")({
  component: Pricing,
})

function Pricing(): JSX.Element {
  return (
    <Section>
      <Heading>Pricing</Heading>
      <Text variant="muted" className="mt-4">
        Simple, transparent pricing is on the way. Check back soon.
      </Text>
    </Section>
  )
}
