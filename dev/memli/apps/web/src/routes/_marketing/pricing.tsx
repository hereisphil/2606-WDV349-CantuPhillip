import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/pricing")({
  component: Pricing,
})

function Pricing(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="mt-4 text-muted-foreground">
        Simple, transparent pricing is on the way. Check back soon.
      </p>
    </section>
  )
}
