import type { JSX, ReactNode } from "react"
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
      <Nav />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  )
}
