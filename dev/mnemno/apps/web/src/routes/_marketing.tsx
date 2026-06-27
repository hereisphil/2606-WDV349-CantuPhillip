import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_marketing")({
  component: () => (
    <div className="flex min-h-dvh w-full flex-col">
      {/* <Header /> */}
      <main className="grow">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  ),
})
