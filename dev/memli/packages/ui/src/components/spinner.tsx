import * as React from "react"
import { LoaderCircle } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Decorative, unlike shadcn's: the busy control carries the localized label (see
 * `.cursor/rules/shadcn-components.mdc`). Reduced motion spins it at half speed.
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
