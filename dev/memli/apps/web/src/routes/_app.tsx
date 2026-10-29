import type { JSX } from "react"
import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout(): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background md:flex-row">
      <aside
        aria-label="Application sidebar"
        className="flex shrink-0 items-center border-b border-sidebar-border bg-sidebar px-4 py-3 md:w-64 md:flex-col md:items-stretch md:border-r md:border-b-0 md:py-6"
      >
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span>Memli</span>
        </Link>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
