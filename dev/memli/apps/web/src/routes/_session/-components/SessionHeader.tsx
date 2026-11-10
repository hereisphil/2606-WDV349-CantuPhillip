import { useEffect, type JSX } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { X } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useFormatters } from "@/lib/formatters"

const messages = {
  exit: "Exit",
  exitKey: "Esc",
  progressLabel: "Session progress",
  progressValue: "{completed} of {total} cards done",
  remaining: {
    one: "{count} card left",
    other: "{count} cards left",
  },
} as const

type SessionHeaderProps = {
  title: string
  /** Cards in the session queue when it started. */
  total: number
  /** Cards finished so far. #49 supplies this from the session reducer. */
  completed: number
}

/** Leaves the session for the dashboard when the learner presses Escape. */
function useExitOnEscape(): void {
  const navigate = useNavigate()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // Open menus and IME composition handle Escape themselves.
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.isComposing
      ) {
        return
      }
      void navigate({ to: "/dashboard" })
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [navigate])
}

export function SessionHeader({
  title,
  total,
  completed,
}: SessionHeaderProps): JSX.Element {
  const { format, plural } = useFormatters()
  useExitOnEscape()

  const remaining = Math.max(0, total - completed)
  const percent = total > 0 ? (completed / total) * 100 : 0

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Button
          variant="ghost"
          className="h-11 shrink-0 gap-2 px-3 text-base"
          aria-keyshortcuts="Escape"
          render={<Link to="/dashboard" />}
          nativeButton={false}
        >
          <X aria-hidden="true" className="size-5" />
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-border px-1.5 font-sans text-xs font-medium text-muted-foreground sm:inline"
          >
            {messages.exitKey}
          </kbd>
          {messages.exit}
        </Button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="truncate font-heading text-base font-semibold">
              {title}
            </h1>
            <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
              {plural(remaining, messages.remaining)}
            </p>
          </div>
          {total > 0 ? (
            <div
              role="progressbar"
              aria-label={messages.progressLabel}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={completed}
              aria-valuetext={format(messages.progressValue, {
                completed,
                total,
              })}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
