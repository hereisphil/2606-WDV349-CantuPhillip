import type { JSX } from "react"
import { marketingSections } from "@/components/marketing-sections"
import { FlashcardDemo } from "./FlashcardDemo"
import { MarketingSection } from "./MarketingSection"

export function WhyMnemonics(): JSX.Element {
  return (
    <MarketingSection
      id={marketingSections.whyMnemonics}
      title="The Mnemonic Magic"
      lede="Why memorize when you can visualize? The community votes on the memory hooks that actually work, so you can skip the grind of rote repetition."
      className="border-y border-border bg-secondary"
    >
      <FlashcardDemo />
    </MarketingSection>
  )
}
