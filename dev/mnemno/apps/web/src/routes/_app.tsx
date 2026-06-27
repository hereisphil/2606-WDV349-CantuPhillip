import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app")({
  // beforeLoad: ({ context }) => {
  //   if (!context.auth?.isAuthenticated) {
  //     throw redirect({ to: "/login" })
  //   }
  // },
  component: () => (
    <div className="flex min-h-dvh w-full">
      {/* <Sidebar /> */}
      <main className="grow p-6">
        <Outlet />
      </main>
    </div>
  ),
})
