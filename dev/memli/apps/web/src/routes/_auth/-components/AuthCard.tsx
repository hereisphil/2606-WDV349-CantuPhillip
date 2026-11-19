import type { JSX, ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@workspace/ui/components/card"
import { BackLink } from "@/components/back-link"
import { BrandMark } from "@/components/brand-mark"

const messages = {
  home: "Home",
} as const

/** A link inside an auth card's sentence. Tall enough to tap (44 px). */
export const authLinkClass =
  "inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"

/** The card every auth page sits in: the brand, a title and the form. */
export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}): JSX.Element {
  return (
    // The way out sits with the card, where the eye already is, not in the page's corner.
    <div className="flex w-full max-w-md flex-col gap-3">
      <BackLink to="/">{messages.home}</BackLink>
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
