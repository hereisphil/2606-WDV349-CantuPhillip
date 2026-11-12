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
 * The main action while a card's answer is hidden. Mount it only then, so
 * the Space shortcut exists only when there is something to reveal.
 */
export function RevealButton({
  onReveal,
}: {
  onReveal: () => void
}): JSX.Element {
  useRevealOnSpace(onReveal)

  return (
    <Button
      // The one primary action on screen: solid, tall, and lifted off the page.
      className="relative h-14 gap-2.5 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      aria-keyshortcuts="Space"
      onClick={onReveal}
    >
      <Eye aria-hidden="true" className="size-5" />
      {messages.reveal}
      {/* Shortcut hint only on hover or keyboard focus. Absolutely placed so the label never shifts. */}
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute right-4 rounded border border-primary-foreground/30 bg-primary-foreground/15 px-1.5 py-0.5 font-sans text-xs font-medium opacity-0 transition-opacity group-hover/button:opacity-100 group-focus-visible/button:opacity-100 motion-reduce:transition-none"
      >
        {messages.revealKey}
      </kbd>
    </Button>
  )
}
