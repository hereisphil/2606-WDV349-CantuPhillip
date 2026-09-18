import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { cn } from "@workspace/ui/lib/utils"

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
  const linkClass = cn("font-ui text-sm font-medium transition-colors", link)

  return (
    <>
      <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <Link to="/" className={linkClass}>
          Home
        </Link>
        <Link to="/" hash="features" className={linkClass}>
          Features
        </Link>
        <Link to="/about" className={linkClass}>
          About
        </Link>
        <Link to="/contact" className={linkClass}>
          Contact
        </Link>
        <Link to="/blog" className={linkClass}>
          Blog
        </Link>
        <Link to="/" hash="why-mnemonics" className={linkClass}>
          Why Mnemonics?
        </Link>
        <Link to="/pricing" className={linkClass}>
          Pricing
        </Link>
        <Link to="/terms" className={linkClass}>
          Terms of Service
        </Link>
        <Link to="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
      </nav>

      <p className={cn("mt-8 text-center text-sm", copyright)}>
        &copy; 2026 Memli. Learn faster, remember forever.
      </p>
    </>
  )
}
