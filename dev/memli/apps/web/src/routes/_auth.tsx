import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SiteFooterNav } from "@/components/site-footer-nav"

export const Route = createFileRoute("/_auth")({
  component: () => (
    <div className="flex min-h-dvh w-full flex-col">
      <main className="flex grow items-center justify-center p-6">
        <Outlet />
      </main>
      <footer className="px-6 py-10">
        <SiteFooterNav tone="onLight" />
      </footer>
    </div>
  ),
})
