import type { JSX, ReactNode } from "react"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"

export function ComingSoon({
  title,
  children,
}: {
  title: string
  children: ReactNode
}): JSX.Element {
  return (
    <Section>
      <Heading>{title}</Heading>
      <Text variant="muted" className="mt-4">
        {children}
      </Text>
    </Section>
  )
}
