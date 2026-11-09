import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/pricing")({
  component: Pricing,
})

function Pricing(): JSX.Element {
  return (
    <ComingSoon title="Pricing">
      Simple, transparent pricing is on the way. Check back soon.
    </ComingSoon>
  )
}
