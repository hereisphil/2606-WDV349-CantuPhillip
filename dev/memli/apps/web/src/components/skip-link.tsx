import type { JSX } from "react"

const messages = {
  skip: "Skip to main content",
} as const

/**
 * The first focusable element on every page (WCAG 2.4.1). Hidden until
 * focused; moves focus to `<main id="main">`.
 */
export function SkipLink(): JSX.Element {
  return (
    <a
      href="#main"
      className="sr-only z-60 rounded-lg bg-card font-semibold text-foreground-strong shadow-lg focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:px-4 focus:py-3"
    >
      {messages.skip}
    </a>
  )
}
