import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing/contact")({
  component: Contact,
})

function Contact() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        We&apos;d love to hear from you. This page is coming soon.
      </p>
    </section>
  )
}
