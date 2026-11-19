import type { JSX, ReactNode } from "react"
import { SkipLink } from "@/components/skip-link"
import { AppSidebar } from "@/routes/_app/-components/AppSidebar"

/**
 * The signed-in app's frame: skip link, sidebar and main. Used by `_app`,
 * and by the public catalog when a learner is signed in (#174).
 */
export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background md:flex-row">
      <SkipLink />
      <AppSidebar />
      {/* tabIndex -1 lets the skip link move focus here. No outline: it is a landmark, not a control. */}
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        {children}
      </main>
    </div>
  )
}
