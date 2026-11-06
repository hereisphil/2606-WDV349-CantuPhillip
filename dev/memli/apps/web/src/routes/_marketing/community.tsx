import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/community")({
  component: Community,
})

function Community(): JSX.Element {
  return (
    <ComingSoon title="Community">
      Connect with other learners and explore shared memory hooks. This page is
      coming soon.
    </ComingSoon>
  )
}
