import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useViewer } from "@/components/session-provider"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()

  return (
    <section className="flex flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">{viewer.displayName}</p>
    </section>
  )
}
