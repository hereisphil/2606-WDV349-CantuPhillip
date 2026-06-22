import { Button } from "@workspace/ui/components/button"

export function App() {
  return (
    <main className="mt-8 flex flex-col items-center justify-center">
      <h1>Hello World</h1>
      <Button onClick={() => window.alert("Hello!")}>Click</Button>
    </main>
  )
}
