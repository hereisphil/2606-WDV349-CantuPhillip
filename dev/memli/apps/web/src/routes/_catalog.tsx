import type { JSX } from "react"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { AppShell } from "@/components/app-shell"
import { MarketingShell } from "@/components/marketing-shell"
import { useOptionalViewer } from "@/components/session-provider"
import { sessionQuery } from "@/lib/queries"

/**
 * The public course catalog (#174): open signed out, never redirects. A
 * visitor gets the marketing frame, a signed-in learner the app's.
 */
export const Route = createFileRoute("/_catalog")({
  // Knowing who is here before the first paint means the frame never swaps.
  beforeLoad: async ({ context }) => {
    // If the session can't be read, the page still opens, as for a visitor.
    await context.queryClient.ensureQueryData(sessionQuery).catch(() => null)
  },
  component: CatalogLayout,
})

function CatalogLayout(): JSX.Element {
  const viewer = useOptionalViewer()
  const Shell =
    viewer === null || viewer === undefined ? MarketingShell : AppShell
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}
