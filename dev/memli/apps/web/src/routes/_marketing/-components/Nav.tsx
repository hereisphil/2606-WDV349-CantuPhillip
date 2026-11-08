import type { JSX } from "react"
import { useState, useEffect, useRef } from "react"
import { Link } from "@tanstack/react-router"
import { LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { BrandMark } from "@/components/brand-mark"
import { MenuGlyph } from "@/components/menu-glyph"
import { PlanBadge } from "@/components/plan-badge"
import {
  headerNav,
  MarketingLink,
  scrollWindowToTop,
} from "@/components/site-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { useViewer, type Viewer } from "@/components/session-provider"

const navItemClass =
  "touch-target inline-flex min-h-6 items-center rounded-md px-3 py-1.5 font-ui text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const mobileNavItemClass =
  "touch-target inline-flex min-h-6 items-center rounded-md px-3 py-2.5 font-ui text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const NavLinks = ({
  className,
  onNavigate,
}: {
  className: string
  onNavigate?: () => void
}): JSX.Element[] => {
  return headerNav.map((id) => (
    <MarketingLink
      key={id}
      id={id}
      className={className}
      onClick={onNavigate}
    />
  ))
}

function ViewerMenu({
  viewer,
  onNavigate,
}: {
  viewer: Viewer
  onNavigate?: () => void
}): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu, @${viewer.username}`}
        render={
          <Button
            variant="ghost"
            className="size-11 rounded-full p-0 data-popup-open:bg-muted"
          />
        }
      >
        <Avatar>
          <AvatarFallback />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 py-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              @{viewer.username}
            </span>
            <PlanBadge plan={viewer.plan} />
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link to="/dashboard" onClick={() => onNavigate?.()} />}
          >
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Nav(): JSX.Element {
  const viewer = useViewer()
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
      className={cn(
        "sticky top-0 z-50 w-full",
        mobileOpen
          ? "h-screen overflow-y-auto overscroll-none bg-background"
          : "bg-background/65 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto hidden max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5 md:grid">
        <Link to="/" className="flex" onClick={scrollWindowToTop}>
          <BrandMark />
        </Link>

        <div className="flex items-center gap-1">
          <NavLinks className={navItemClass} />
        </div>

        <div className="flex justify-end">
          <ViewerMenu viewer={viewer} />
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:hidden">
        <Link
          to="/"
          className="text-xl font-semibold"
          onClick={() => {
            scrollWindowToTop()
            setMobileOpen(false)
          }}
        >
          Memli
        </Link>

        <div className="flex items-center gap-1">
          <ViewerMenu viewer={viewer} onNavigate={() => setMobileOpen(false)} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <MenuGlyph open={mobileOpen} />
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
