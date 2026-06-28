import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Nav } from "./_marketing/-components/Nav"
export const Route = createFileRoute("/_marketing")({
  component: () => (
    <div className="flex min-h-dvh w-full flex-col">
      <Nav />
      <main className="grow">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  ),
})
