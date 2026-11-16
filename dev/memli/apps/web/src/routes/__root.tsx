import { lazy, Suspense, type ComponentType } from "react"
import type { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
} from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

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

// Same gating as the devtools: a quick jump to the `?preview=` snapshots while developing.
const DevPreviewsMenu: ComponentType =
  import.meta.env.PROD || import.meta.env.VITE_A11Y_AUDIT === "1"
    ? () => null
    : lazy(() => import("@/components/dev-previews-menu"))

/** What every route's loader gets, set in main.tsx. */
type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      {/* Renders each route's head(), such as the page title. */}
      <HeadContent />
      <Outlet />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
        <DevPreviewsMenu />
      </Suspense>
    </>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404: Page not found.</h1>
      <Link to="/" className={cn(buttonVariants())}>
        Go to home
      </Link>
    </div>
  ),
})
