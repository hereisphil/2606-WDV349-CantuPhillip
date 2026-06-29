import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { BookOpen, Menu, X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const navItemClass =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const mobileNavItemClass =
  "rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

const navLinks = [
  { to: "/" as const, label: "Home", exact: true },
  { to: "/" as const, hash: "why-mnemonics", label: "Why Mnemonics?" },
  { to: "/" as const, hash: "features", label: "Features" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
  { to: "/blog" as const, label: "Blog" },
]

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="w-full">
      <nav className="mx-auto hidden max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 md:grid">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span>Memli</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, ...rest }) => (
            <Link
              key={label}
              to={to}
              {...("hash" in rest ? { hash: rest.hash } : {})}
              {...("exact" in rest ? { activeOptions: { exact: true } } : {})}
              className={cn(
                navItemClass,
                "exact" in rest &&
                  "data-[status=active]:bg-muted data-[status=active]:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex justify-end">
          <Button render={<Link to="/signin" />} nativeButton={false}>
            Get Started
          </Button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:hidden">
        <Button render={<Link to="/signin" />} nativeButton={false}>
          Get Started
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-1 border-t px-6 py-4 md:hidden"
        >
          {navLinks.map(({ to, label, ...rest }) => (
            <Link
              key={label}
              to={to}
              {...("hash" in rest ? { hash: rest.hash } : {})}
              {...("exact" in rest ? { activeOptions: { exact: true } } : {})}
              className={cn(
                mobileNavItemClass,
                "exact" in rest &&
                  "data-[status=active]:bg-muted data-[status=active]:text-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  )
}
