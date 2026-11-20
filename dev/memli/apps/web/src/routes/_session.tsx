import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { requireViewer } from "@/lib/session"

// Distraction-free shell for study sessions: no app sidebar, no marketing chrome.
// Pathless, so `/study/$courseId` keeps its URL. Providers live in `main.tsx`.
export const Route = createFileRoute("/_session")({
  // The preview list loads only in development; production has no previews.
  beforeLoad: requireViewer(
    import.meta.env.DEV
      ? async (preview) =>
          (
            await import("./_session/-components/study-previews")
          ).isStudyPreviewName(preview)
      : undefined
  ),
  component: SessionLayout,
})

function SessionLayout(): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <Outlet />
    </div>
  )
}
