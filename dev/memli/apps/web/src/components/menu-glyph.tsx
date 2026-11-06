import type { JSX } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function MenuGlyph({ open }: { open: boolean }): JSX.Element {
  return (
    <div className="relative flex h-5 w-5 flex-col items-center justify-center">
      <span
        className={cn(
          "absolute h-0.5 w-5 bg-foreground transition-all duration-300",
          open ? "rotate-45" : "-translate-y-1.5"
        )}
      />
      <span
        className={cn(
          "h-0.5 w-5 bg-foreground transition-all duration-300",
          open ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        className={cn(
          "absolute h-0.5 w-5 bg-foreground transition-all duration-300",
          open ? "-rotate-45" : "translate-y-1.5"
        )}
      />
    </div>
  )
}
