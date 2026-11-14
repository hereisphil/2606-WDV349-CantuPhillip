import { useEffect, type JSX } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { X } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ThemeMenu } from "@/components/theme-control"
import { useFormatters } from "@/lib/formatters"

const messages = {
  exit: "Exit",
  exitKey: "Esc",
  progressLabel: "Session progress",
  progressValue: {
    one: "{completed} of {count} word done",
    other: "{completed} of {count} words done",
  },
  remaining: {
    one: "{count} word left",
    other: "{count} words left",
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
  const { plural } = useFormatters()
  useExitOnEscape()

  const remaining = Math.max(0, total - completed)
  const percent = total > 0 ? (completed / total) * 100 : 0

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      {/*
        Below md, two rows: Exit and Theme, then the title and progress at full width, so the title isn't squeezed.
        From md up, one row: a centered column the width of the card (max-w-xl) holds the progress, so it stays short and lines up with the card.
      */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-6 md:grid md:grid-cols-[1fr_minmax(0,36rem)_1fr] md:gap-6">
        <Link
          to="/dashboard"
          aria-keyshortcuts="Escape"
          className={cn(
            buttonVariants({ variant: "ghost", size: "touch" }),
            "shrink-0 px-3 md:justify-self-start"
          )}
        >
          <X aria-hidden="true" className="size-5" />
          {/* Visually hidden on phones so the control is icon-only, but still names the link. */}
          <span className="sr-only sm:not-sr-only">{messages.exit}</span>
          {/* Shortcut hint only while hovering (or keyboard-focusing) the control. */}
          <kbd
            aria-hidden="true"
            className="hidden rounded border border-border px-1.5 font-sans text-xs font-medium text-muted-foreground group-hover/button:inline group-focus-visible/button:inline"
          >
            {messages.exitKey}
          </kbd>
        </Link>
        <div className="order-last flex w-full min-w-0 flex-col gap-2 md:order-none md:w-auto">
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
              aria-valuetext={plural(total, messages.progressValue, {
                completed,
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
        {/* Same "Theme" menu as the app's phone header, so it reads the same everywhere. */}
        <div className="shrink-0 md:justify-self-end">
          <ThemeMenu placement="topBar" />
        </div>
      </div>
    </header>
  )
}
