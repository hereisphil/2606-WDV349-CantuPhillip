import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

export const Route = createFileRoute("/_marketing/")({
  component: Index,
})

function Index() {
  return (
    <section className="mt-8 flex flex-col items-center justify-center">
      <h1>Hello World</h1>
      <Button onClick={() => window.alert("Hello!")}>Click</Button>
    </section>
  )
}
