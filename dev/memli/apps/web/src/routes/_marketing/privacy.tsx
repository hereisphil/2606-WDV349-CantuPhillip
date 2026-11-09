import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/privacy")({
  component: Privacy,
})

function Privacy(): JSX.Element {
  return (
    <ComingSoon title="Privacy Policy">
      Our privacy policy is being finalized. Check back soon.
    </ComingSoon>
  )
}
