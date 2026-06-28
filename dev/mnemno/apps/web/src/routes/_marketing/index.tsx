import { createFileRoute } from "@tanstack/react-router"
import { Hero } from "./-components/Hero"

export const Route = createFileRoute("/_marketing/")({
  component: Index,
})

function Index() {
  return <Hero />
}
