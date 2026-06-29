import { FlashcardDemo } from "./FlashcardDemo"

export function WhyMnemonics() {
  return (
    <section id="why-mnemonics" className="scroll-mt-16 bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <FlashcardDemo />
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">The Mnemonic Magic</h2>
          <p className="mt-4 text-muted-foreground">
            Why memorize when you can visualize? Our community votes on the most
            effective memory hooks so you can bypass the struggle of rote
            memorization.
          </p>
        </div>
      </div>
    </section>
  )
}
