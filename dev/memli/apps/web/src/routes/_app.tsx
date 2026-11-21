import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { requireViewer } from "@/lib/session"
import { AppShell } from "@/components/app-shell"

export const Route = createFileRoute("/_app")({
  // The preview list loads only in development; production has no previews.
  beforeLoad: requireViewer(
    import.meta.env.DEV
      ? async (preview) =>
          (await import("./_app/-components/dashboard-previews")).isPreviewName(
            preview
          )
      : undefined
  ),
  component: AppLayout,
})

function AppLayout(): JSX.Element {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
