import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/contact")({
  component: Contact,
})

function Contact(): JSX.Element {
  return (
    <Section>
      <Heading>Contact</Heading>
      <Text variant="muted" className="mt-4">
        We&apos;d love to hear from you. This page is coming soon.
      </Text>
    </Section>
  )
}
