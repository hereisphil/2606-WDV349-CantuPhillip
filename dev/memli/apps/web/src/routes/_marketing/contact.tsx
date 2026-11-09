import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/contact")({
  component: Contact,
})

function Contact(): JSX.Element {
  return (
    <ComingSoon title="Contact">
      We&apos;d love to hear from you. This page is coming soon.
    </ComingSoon>
  )
}
