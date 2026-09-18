import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

export function BackToHome(): JSX.Element {
  return (
    <div className="p-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  )
}
