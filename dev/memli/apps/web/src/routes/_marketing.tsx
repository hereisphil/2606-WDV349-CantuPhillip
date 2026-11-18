import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MarketingShell } from "@/components/marketing-shell"

export const Route = createFileRoute("/_marketing")({
  component: () => (
    <MarketingShell>
      <Outlet />
    </MarketingShell>
  ),
})
