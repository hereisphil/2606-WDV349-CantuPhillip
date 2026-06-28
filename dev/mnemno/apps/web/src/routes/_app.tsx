import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app")({
  // beforeLoad: ({ context }) => {
  //   if (!context.auth?.isAuthenticated) {
  // TODO: import  redirect from "@tanstack/react-router" and redirect to sign in if not authenticated
  //     throw redirect({ to: "/signin" })
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
