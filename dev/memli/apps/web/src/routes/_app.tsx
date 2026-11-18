import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { requireViewer } from "@/lib/session"
import { AppSidebar } from "./_app/-components/AppSidebar"

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

const messages = {
  skip: "Skip to main content",
} as const

function AppLayout(): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background md:flex-row">
      {/* First focusable element on every app page (WCAG 2.4.1). Hidden until focused. */}
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-card font-semibold text-foreground-strong shadow-lg focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:px-4 focus:py-3"
      >
        {messages.skip}
      </a>
      <AppSidebar />
      {/* tabIndex -1 lets the skip link move focus here. No outline: it is a landmark, not a control. */}
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        <Outlet />
      </main>
    </div>
  )
}
