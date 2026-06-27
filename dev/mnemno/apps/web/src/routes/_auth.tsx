import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
  component: () => (
    <div className="flex min-h-dvh w-full flex-col">
      {/* <BackToHome /> */}
      <main className="flex grow items-center justify-center p-6">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  ),
})
