import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/about")({
  component: About,
})

function About(): JSX.Element {
  return (
    <ComingSoon title="About">
      Learn more about Memli and our mission. This page is coming soon.
    </ComingSoon>
  )
}
