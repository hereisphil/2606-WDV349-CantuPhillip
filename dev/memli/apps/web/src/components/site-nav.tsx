/* eslint-disable react-refresh/only-export-components */
import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { marketingSections } from "@/components/marketing-sections"

const pages = {
  home: { to: "/" as const, label: "Home", scrollToTop: true },
  whyMnemonics: {
    to: "/" as const,
    hash: marketingSections.whyMnemonics,
    label: "Why Mnemonics?",
  },
  features: {
    to: "/" as const,
    hash: marketingSections.features,
    label: "Features",
  },
  about: { to: "/about" as const, label: "About", scrollToTop: true },
  contact: { to: "/contact" as const, label: "Contact", scrollToTop: true },
  blog: { to: "/blog" as const, label: "Blog", scrollToTop: true },
  pricing: { to: "/pricing" as const, label: "Pricing" },
  terms: { to: "/terms" as const, label: "Terms of Service" },
  privacy: { to: "/privacy" as const, label: "Privacy Policy" },
}

type PageId = keyof typeof pages

export const headerNav = [
  "home",
  "whyMnemonics",
  "features",
  "about",
  "contact",
  "blog",
] as const satisfies readonly PageId[]

export const footerNav = [
  "home",
  "features",
  "about",
  "contact",
  "blog",
  "whyMnemonics",
  "pricing",
  "terms",
  "privacy",
] as const satisfies readonly PageId[]

export function scrollWindowToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
}

function scrollsToTop(page: (typeof pages)[PageId]): boolean {
  return "scrollToTop" in page && page.scrollToTop === true
}

export function MarketingLink({
  id,
  className,
  onClick,
}: {
  id: PageId
  className: string
  onClick?: () => void
}): JSX.Element {
  const page = pages[id]
  const handleClick = (): void => {
    if (scrollsToTop(page)) scrollWindowToTop()
    onClick?.()
  }

  return (
    <MarketingRouteLink page={page} className={className} onClick={handleClick}>
      {page.label}
    </MarketingRouteLink>
  )
}

function MarketingRouteLink({
  page,
  className,
  onClick,
  children,
}: {
  page: (typeof pages)[PageId]
  className: string
  onClick?: () => void
  children: ReactNode
}): JSX.Element {
  if (page.to === "/") {
    return (
      <Link
        to="/"
        hash={"hash" in page ? page.hash : undefined}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link to={page.to} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
