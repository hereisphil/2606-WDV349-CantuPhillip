import * as React from "react"
import { LoaderCircle } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * shadcn/ui's spinner: lucide's LoaderCircle turned by Tailwind's
 * `animate-spin`. Two changes from the registry version:
 *
 * - Decorative by default (`aria-hidden`) instead of `role="status"` with an
 *   English "Loading" label. The control that is busy says so (for example
 *   `aria-busy` and a localized label on a button), so this package holds no
 *   UI copy and nothing is announced twice.
 * - Spins at half speed for people who ask for reduced motion, so it still
 *   reads as "working".
 */
function Spinner({
  className,
  ...props
}: React.ComponentProps<"svg">): React.JSX.Element {
  return (
    <LoaderCircle
      data-slot="spinner"
      aria-hidden="true"
      className={cn(
        "size-4 animate-spin motion-reduce:animate-[spin_2s_linear_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
