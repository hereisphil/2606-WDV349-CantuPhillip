import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { SiteFooterNav } from "@/components/site-footer-nav"

const footerButtonClass = "w-full px-6 sm:w-auto"

export function Footer(): JSX.Element {
  return (
    <footer className="bg-brand-charcoal text-brand-surface">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Ready to stop forgetting?
          </h2>
          <p className="mt-4 max-w-md text-lg text-pretty text-brand-surface/75">
            Join other language learners optimizing their brains and learning
            with Memli.
          </p>
          <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              to="/signin"
              className={cn(
                buttonVariants({ size: "touch" }),
                footerButtonClass
              )}
            >
              Start Learning Free
            </Link>
            <Link
              to="/courses"
              className={cn(
                buttonVariants({ variant: "outline", size: "touch" }),
                footerButtonClass,
                "border-brand-slate bg-transparent text-brand-surface hover:bg-white/10 hover:text-white"
              )}
            >
              Explore Courses
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <SiteFooterNav tone="onDark" />
        </div>
      </div>
    </footer>
  )
}
