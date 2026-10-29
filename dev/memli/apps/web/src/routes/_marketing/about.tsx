import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/about")({
  component: About,
})

function About(): JSX.Element {
  return (
    <Section>
      <Heading>About</Heading>
      <Text variant="muted" className="mt-4">
        Learn more about Memli and our mission. This page is coming soon.
      </Text>
    </Section>
  )
}
