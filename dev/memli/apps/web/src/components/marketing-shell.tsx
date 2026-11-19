import type { JSX, ReactNode } from "react"
import { SkipLink } from "@/components/skip-link"
import { Footer } from "@/routes/_marketing/-components/Footer"
import { Nav } from "@/routes/_marketing/-components/Nav"

/**
 * The public site's frame: header, main and footer. Used by `_marketing`,
 * and by the public catalog for a visitor (#174).
 */
export function MarketingShell({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      {/* Ten header links come first, so a keyboard needs a way past them. */}
      <SkipLink />
      <Nav />
      {/* tabIndex -1 lets the skip link move focus here. No outline: it is a landmark, not a control. */}
      <main id="main" tabIndex={-1} className="grow outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}
