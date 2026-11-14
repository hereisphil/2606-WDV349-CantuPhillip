import { useEffect, type JSX } from "react"
import { Eye } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const messages = {
  reveal: "Reveal answer",
  revealKey: "Space",
} as const

/** Controls that use Space themselves: a focused one keeps it. */
const usesSpace =
  "button, input, textarea, select, summary, [role='button'], [contenteditable='true']"

/**
 * Reveals the answer when the learner presses Space, the usual "flip the
 * card" key in flashcard apps. Enter is left for submitting a typed answer.
 */
function useRevealOnSpace(onReveal: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (
        event.key !== " " ||
        event.defaultPrevented ||
        event.isComposing ||
        // Holding the key down must not carry into the next card.
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return
      }
      if (
        event.target instanceof Element &&
        event.target.closest(usesSpace) !== null
      ) {
        return
      }
      // Space would otherwise scroll the page.
      event.preventDefault()
      onReveal()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [onReveal])
}

/**
 * Shows the answer without typing. Mount it only while the answer is hidden,
 * so the Space shortcut exists only when there is something to reveal.
 */
export function RevealButton({
  onReveal,
}: {
  onReveal: () => void
}): JSX.Element {
  useRevealOnSpace(onReveal)

  return (
    <Button
      // Secondary to Submit (one primary action per screen), but still a large, lifted target.
      variant="outline"
      className="relative h-12 gap-2.5 rounded-xl bg-card text-base font-semibold shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:text-primary hover:shadow-md active:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      aria-keyshortcuts="Space"
      onClick={onReveal}
    >
      <Eye aria-hidden="true" className="size-5" />
      {messages.reveal}
      {/* Shortcut hint only on hover or keyboard focus. Absolutely placed so the label never shifts. */}
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-4 rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover/button:opacity-100 group-focus-visible/button:opacity-100 motion-reduce:transition-none"
      >
        {messages.revealKey}
      </kbd>
    </Button>
  )
}
