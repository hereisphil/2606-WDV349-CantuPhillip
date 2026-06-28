import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/about")({
  component: About,
})

function About() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-4 text-muted-foreground">
        Learn more about Mnemno and our mission. This page is coming soon.
      </p>
    </section>
  )
}
