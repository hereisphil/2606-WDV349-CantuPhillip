import type { JSX } from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate] select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 motion-safe:active:not-aria-[haspopup]:translate-y-px dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border-strong bg-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "min-h-6 text-primary underline-offset-4 hover:underline",
        // The one main action on a screen. Amber with a darker bottom edge: hover
        // lifts it 1 px, press sinks it 2 px, and reduced motion keeps it still.
        cta: "bg-cta font-semibold text-cta-foreground shadow-(--cta-shadow) hover:bg-cta-hover hover:shadow-(--cta-shadow-hover) active:bg-cta-active active:shadow-(--cta-shadow-active) motion-safe:hover:-translate-y-px motion-safe:active:not-aria-[haspopup]:translate-y-0.5",
        // The second button on the hero. The fill alone is too close to the hero,
        // so the border is what makes it read as a button.
        "hero-quiet":
          "border-hero-muted-foreground bg-hero-chip font-semibold text-hero-foreground hover:border-hero-foreground hover:bg-hero-chip-hover aria-expanded:bg-hero-chip-hover",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        // h-6 / size-6 = 24px — floor for WCAG 2.2 AA SC 2.5.8 Target Size (Minimum)
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        // Touch sizes set min heights so a long translated label wraps instead of
        // overflowing. 44 px: row buttons and other controls.
        touch:
          "h-auto min-h-11 max-w-full shrink gap-2 px-4 py-2 text-center text-base leading-snug text-balance whitespace-normal",
        // 44 px square: icon-only buttons.
        "icon-touch": "size-11",
        // 48 px: the second button on the hero, and form submits.
        "touch-lg":
          "h-auto min-h-12 max-w-full shrink gap-2 px-5 py-2.5 text-center text-base leading-snug text-balance whitespace-normal",
        // 56 px: the main button.
        "touch-xl":
          "h-auto min-h-14 max-w-full shrink gap-2.5 px-6 py-3 text-center text-lg leading-snug text-balance whitespace-normal [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>): JSX.Element {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
