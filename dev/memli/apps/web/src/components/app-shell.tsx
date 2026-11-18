import type { JSX, ReactNode } from "react"
import { AppSidebar } from "@/routes/_app/-components/AppSidebar"

const messages = {
  skip: "Skip to main content",
} as const

/**
 * The signed-in app's frame: skip link, sidebar and main. Used by `_app`,
 * and by the public catalog when a learner is signed in (#174).
 */
export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background md:flex-row">
      {/* First focusable element on every app page (WCAG 2.4.1). Hidden until focused. */}
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-card font-semibold text-foreground-strong shadow-lg focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:px-4 focus:py-3"
      >
        {messages.skip}
      </a>
      <AppSidebar />
      {/* tabIndex -1 lets the skip link move focus here. No outline: it is a landmark, not a control. */}
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
        {children}
      </main>
    </div>
  )
}
