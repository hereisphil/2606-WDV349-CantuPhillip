import { lazy, Suspense, type ComponentType } from "react"
import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

// Hidden in production and during the axe audit (VITE_A11Y_AUDIT), so CI only
// judges product UI — not the floating TanStack Router Devtools button.
const TanStackRouterDevtools: ComponentType<{
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right"
}> =
  import.meta.env.PROD || import.meta.env.VITE_A11Y_AUDIT === "1"
    ? () => null
    : lazy(() =>
        import("@tanstack/react-router-devtools").then((mod) => ({
          default: mod.TanStackRouterDevtools,
        }))
      )

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404: Page not found.</h1>
      <Button render={<Link to="/" />} nativeButton={false}>
        Go to home
      </Button>
    </div>
  ),
})
