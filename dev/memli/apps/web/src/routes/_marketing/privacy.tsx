import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export const Route = createFileRoute("/_marketing/privacy")({
  component: Privacy,
})

function Privacy(): JSX.Element {
  return (
    <Section>
      <Heading>Privacy Policy</Heading>
      <Text variant="muted" className="mt-4">
        Our privacy policy is being finalized. Check back soon.
      </Text>
    </Section>
  )
}
