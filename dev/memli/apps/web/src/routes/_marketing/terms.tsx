import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/terms")({
  component: Terms,
})

function Terms(): JSX.Element {
  return (
    <ComingSoon title="Terms of Service">
      Our terms of service are being finalized. Check back soon.
    </ComingSoon>
  )
}
