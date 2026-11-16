import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"

// Distraction-free shell for study sessions: no app sidebar, no marketing chrome.
// Pathless, so `/study/$courseId` keeps its URL. Providers live in `main.tsx`.
export const Route = createFileRoute("/_session")({
  component: SessionLayout,
})

function SessionLayout(): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <Outlet />
    </div>
  )
}
