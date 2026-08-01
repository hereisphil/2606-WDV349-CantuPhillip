import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/terms")({
  component: Terms,
})

function Terms(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-4 text-muted-foreground">
        Our terms of service are being finalized. Check back soon.
      </p>
    </section>
  )
}
