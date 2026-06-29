import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404: Page not found.</h1>
      <Link
        to="/"
        className="rounded-md bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary/80"
      >
        Go to home
      </Link>
    </div>
  ),
})
