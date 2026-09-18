import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  return (
    <section className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
    </section>
  )
}
