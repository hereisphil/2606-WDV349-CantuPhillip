import type { JSX, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@workspace/ui/components/card"
import { BackLink } from "@/components/back-link"
import { BrandMark } from "@/components/brand-mark"
import { catalogCourseQuery } from "@/lib/queries"

const messages = {
  home: "Home",
  course: "Back to the course",
} as const

/**
 * The course a return path studies, as `/study/japanese-kana?mode=learn`
 * does when a visitor taps Start learning on a course page (#174).
 */
function courseIdOf(returnTo: string | undefined): string | null {
  const match = /^\/study\/([^/?#]+)/.exec(returnTo ?? "")
  if (match?.[1] === undefined) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}

/**
 * Back to the course the visitor was reading, by its title, or home. The
 * title is usually cached from that page; until it arrives, a plain label.
 */
function AuthBackLink({
  returnTo,
}: {
  returnTo: string | undefined
}): JSX.Element {
  const courseId = courseIdOf(returnTo)
  const { data: course } = useQuery({
    ...catalogCourseQuery(courseId ?? ""),
    enabled: courseId !== null,
  })
  if (courseId === null) return <BackLink to="/">{messages.home}</BackLink>
  return (
    <BackLink courseId={courseId}>{course?.title ?? messages.course}</BackLink>
  )
}

/** A link inside an auth card's sentence. Tall enough to tap (44 px). */
export const authLinkClass =
  "inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"

/** The card every auth page sits in: the brand, a title and the form. */
export function AuthCard({
  title,
  description,
  returnTo,
  children,
}: {
  title: string
  description: string
  /** Where signing in or up leads: the back link returns to its course, if it has one. */
  returnTo: string | undefined
  children: ReactNode
}): JSX.Element {
  return (
    // The way out sits with the card, where the eye already is, not in the page's corner.
    <div className="flex w-full max-w-md flex-col gap-3">
      <AuthBackLink returnTo={returnTo} />
      <Card className="shadow-sm [--card-spacing:--spacing(6)]">
        <CardHeader className="items-center text-center">
          <div className="flex justify-center text-primary">
            <BrandMark wordClassName="text-lg" />
          </div>
          {/* An h1, not CardTitle's div: it is the page's one heading. */}
          <h1 className="mt-4 font-heading text-2xl leading-snug font-bold tracking-tight">
            {title}
          </h1>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">{children}</CardContent>
      </Card>
    </div>
  )
}
