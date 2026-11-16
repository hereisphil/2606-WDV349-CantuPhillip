import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { BrandMark } from "@/components/brand-mark"
import { marketingSections } from "@/components/marketing-sections"

const heroButtonClass = "w-full px-7 sm:w-auto"

export function Hero(): JSX.Element {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-var(--marketing-header-clearance))] max-w-4xl flex-col items-center justify-center px-6 pt-16 pb-24 text-center">
      <BrandMark size="hero" />

      <h1 className="mt-10 text-5xl font-semibold text-balance sm:mt-12 sm:text-6xl lg:text-7xl">
        Stop Brute-Forcing Your{" "}
        <span className="text-primary">Vocabulary.</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:mt-8 sm:text-xl">
        Spaced repetition meets crowdsourced visual memory hooks, so a new word
        sticks the first time you meet it.
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center">
        <Link
          to="/signin"
          className={cn(buttonVariants({ size: "touch-lg" }), heroButtonClass)}
        >
          Claim Your Username
        </Link>
        <Link
          to="/"
          hash={marketingSections.whyMnemonics}
          className={cn(
            buttonVariants({ variant: "outline", size: "touch-lg" }),
            heroButtonClass
          )}
        >
          See How It Works
        </Link>
      </div>
    </section>
  )
}
