import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/privacy")({
  component: Privacy,
})

function Privacy() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">
        Our privacy policy is being finalized. Check back soon.
      </p>
    </section>
  )
}
