import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

const linkClass =
  "inline-flex min-h-11 items-center gap-1 self-start text-base font-semibold text-link"

type BackLinkProps = { children: ReactNode } & (
  | { to: "/" | "/courses" }
  /** A course's overview page. */
  | { courseId: string }
)

/**
 * "‹ All courses": a link back to where the learner came from, named by its
 * destination. Above a page's heading, or above the sign-in and sign-up cards.
 */
export function BackLink(props: BackLinkProps): JSX.Element {
  const content = (
    <>
      <ChevronLeft aria-hidden="true" className="size-5 shrink-0" />
      {props.children}
    </>
  )
  if ("courseId" in props) {
    return (
      <Link
        to="/courses/$courseId"
        params={{ courseId: props.courseId }}
        className={linkClass}
      >
        {content}
      </Link>
    )
  }
  return (
    <Link to={props.to} className={linkClass}>
      {content}
    </Link>
  )
}
