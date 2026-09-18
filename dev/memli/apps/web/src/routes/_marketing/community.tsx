import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/community")({
  component: Community,
})

function Community(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Community</h1>
      <p className="mt-4 text-muted-foreground">
        Connect with other learners and explore shared memory hooks. This page
        is coming soon.
      </p>
    </section>
  )
}
