import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/signin")({
  component: SignIn,
})

function SignIn() {
  return (
    <section className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold tracking-tight">SignIn</h1>
    </section>
  )
}
