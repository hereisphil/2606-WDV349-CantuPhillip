import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"

export function Hero(): JSX.Element {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
      <h1 className="text-4xl font-extrabold sm:text-5xl">
        Stop Brute-Forcing Your{" "}
        <span className="text-primary">Vocabulary.</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Spaced repetition meets crowdsourced visual memory hooks. Learn faster,
        remember forever.
      </p>
      <div className="mt-8">
        <Button size="lg" render={<Link to="/signin" />} nativeButton={false}>
          Claim Your Username
        </Button>
      </div>
    </section>
  )
}
