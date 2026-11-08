import type { JSX } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { footerNav, MarketingLink } from "@/components/site-nav"

type Tone = "onLight" | "onDark"

const tones: Record<Tone, { link: string; copyright: string }> = {
  onLight: {
    link: "text-muted-foreground hover:text-foreground",
    copyright: "text-muted-foreground",
  },
  onDark: {
    link: "text-brand-surface/75 hover:text-white",
    copyright: "text-brand-surface/60",
  },
}

export function SiteFooterNav({
  tone = "onDark",
}: {
  tone?: Tone
}): JSX.Element {
  const { link, copyright } = tones[tone]
  const linkClass = cn(
    "touch-target inline-flex items-center font-ui text-sm font-medium transition-colors",
    link
  )

  return (
    <>
      <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {footerNav.map((id) => (
          <MarketingLink key={id} id={id} className={linkClass} />
        ))}
      </nav>

      <p className={cn("mt-8 text-center text-sm", copyright)}>
        &copy; 2026 Memli. Learn faster, remember forever.
      </p>
    </>
  )
}
