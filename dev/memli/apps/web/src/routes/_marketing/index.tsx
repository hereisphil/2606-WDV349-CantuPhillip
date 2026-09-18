import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Hero } from "./-components/Hero"
import { WhyMnemonics } from "./-components/WhyMnemonics"
import { Features } from "./-components/Features"

export const Route = createFileRoute("/_marketing/")({
  component: Index,
})

function Index(): JSX.Element {
  return (
    <>
      <Hero />
      <WhyMnemonics />
      <Features />
    </>
  )
}
