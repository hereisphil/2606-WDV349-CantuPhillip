import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { AppSidebar } from "./_app/-components/AppSidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout(): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background md:flex-row">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
