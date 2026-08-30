import type { JSX } from "react"
import { useState, useEffect, useRef } from "react"
import { Link } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const navItemClass =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const mobileNavItemClass =
  "rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const navLinks = [
  { to: "/" as const, label: "Home", exact: true, scrollToTop: true },
  { to: "/" as const, hash: "why-mnemonics", label: "Why Mnemonics?" },
  { to: "/" as const, hash: "features", label: "Features" },
  { to: "/about" as const, label: "About", scrollToTop: true },
  { to: "/contact" as const, label: "Contact", scrollToTop: true },
  { to: "/blog" as const, label: "Blog", scrollToTop: true },
]

const scrollToTop = (): void =>
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" })

const NavLinks = ({
  className,
  onNavigate,
}: {
  className: string
  onNavigate?: () => void
}): JSX.Element[] => {
  return navLinks.map(({ to, label, hash, scrollToTop: toTop }) => (
    <Link
      key={label}
      to={to}
      hash={hash}
      className={className}
      onClick={() => {
        if (toTop) scrollToTop()
        onNavigate?.()
      }}
    >
      {label}
    </Link>
  ))
}

export function Nav(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!mobileOpen) return

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setMobileOpen(false)
        return
      }

      if (e.key === "Tab" && headerRef.current) {
        const focusableElements = Array.from(
          headerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.getClientRects().length > 0)

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"

      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollBarWidth}px`

      return () => {
        document.body.style.overflow = originalStyle
        document.body.style.paddingRight = ""
      }
    }
  }, [mobileOpen])

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full ${mobileOpen ? "h-screen overflow-y-auto overscroll-none bg-background" : "bg-background/65 backdrop-blur-sm"}`}
    >
      <nav className="mx-auto hidden max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 md:grid">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold"
          onClick={scrollToTop}
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span>Memli</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLinks className={navItemClass} />
        </div>

        <div className="flex justify-end">
          <Button render={<Link to="/signin" />} nativeButton={false}>
            Get Started
          </Button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:hidden">
        <Link
          to="/"
          className="text-xl font-semibold"
          onClick={() => {
            scrollToTop()
            setMobileOpen(false)
          }}
        >
          Memli
        </Link>

        <div className="flex items-center gap-2">
          <Button render={<Link to="/signin" />} nativeButton={false} size="sm">
            Get Started
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <div className="relative flex h-5 w-5 flex-col items-center justify-center">
              <span
                className={cn(
                  "absolute h-0.5 w-5 bg-foreground transition-all duration-300",
                  mobileOpen ? "rotate-45" : "-translate-y-1.5"
                )}
              />
              <span
                className={cn(
                  "h-0.5 w-5 bg-foreground transition-all duration-300",
                  mobileOpen ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "absolute h-0.5 w-5 bg-foreground transition-all duration-300",
                  mobileOpen ? "-rotate-45" : "translate-y-1.5"
                )}
              />
            </div>
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 px-6 py-4 md:hidden"
        >
          <NavLinks
            className={mobileNavItemClass}
            onNavigate={() => setMobileOpen(false)}
          />
        </nav>
      ) : null}
    </header>
  )
}
