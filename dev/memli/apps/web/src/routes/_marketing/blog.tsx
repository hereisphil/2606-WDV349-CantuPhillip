import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/blog")({
  component: Blog,
})

function Blog(): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-4 text-muted-foreground">
        Articles and updates are on the way. Check back soon.
      </p>
    </section>
  )
}
