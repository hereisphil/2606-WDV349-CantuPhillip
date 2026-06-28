import { Link } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const navItemClass =
  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function Nav() {
  return (
    <header className="w-full">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          <span>Mnemno</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className={cn(
              navItemClass,
              "data-[status=active]:bg-muted data-[status=active]:text-foreground"
            )}
          >
            Home
          </Link>
          <button
            type="button"
            onClick={() => scrollToId("features")}
            className={navItemClass}
          >
            Features
          </button>
          <Link to="/about" className={navItemClass}>
            About
          </Link>
          <Link to="/contact" className={navItemClass}>
            Contact
          </Link>
          <Link to="/blog" className={navItemClass}>
            Blog
          </Link>
          <button
            type="button"
            onClick={() => scrollToId("whyMnemonics")}
            className={navItemClass}
          >
            Why Mnemonics?
          </button>
        </div>

        <div className="flex justify-end">
          <Button render={<Link to="/signin" />} nativeButton={false}>
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  )
}
