import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

/**
 * "‹ All courses": a link back to where the learner came from, named by its
 * destination. Above a page's heading, or above the sign-in and sign-up cards.
 */
export function BackLink({
  to,
  children,
}: {
  to: "/" | "/courses"
  children: ReactNode
}): JSX.Element {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center gap-1 self-start text-base font-semibold text-link"
    >
      <ChevronLeft aria-hidden="true" className="size-5" />
      {children}
    </Link>
  )
}
