import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ComingSoon } from "./-components/ComingSoon"

export const Route = createFileRoute("/_marketing/blog")({
  component: Blog,
})

function Blog(): JSX.Element {
  return (
    <ComingSoon title="Blog">
      Articles and updates are on the way. Check back soon.
    </ComingSoon>
  )
}
