import type { JSX } from "react"
import { FlashcardDemo } from "./FlashcardDemo"

export function WhyMnemonics(): JSX.Element {
  return (
    <section
      id="why-mnemonics"
      className="scroll-mt-24 border-y border-border bg-secondary"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-16">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            The Mnemonic Magic
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            Why memorize when you can visualize? The community votes on the
            memory hooks that actually work, so you can skip the grind of rote
            repetition.
          </p>
        </div>
        <FlashcardDemo />
      </div>
    </section>
  )
}
