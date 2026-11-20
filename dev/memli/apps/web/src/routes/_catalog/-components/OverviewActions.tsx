import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Check, Info } from "lucide-react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"

const messages = {
  start: "Start learning",
  signUpFirst: "First, you'll make an account.",
  add: "Add to my courses",
  continue: "Continue",
  toReview: {
    one: "{count} word to review",
    other: "{count} words to review",
  },
  newWords: {
    one: "{count} new word to learn",
    other: "{count} new words to learn",
  },
  allDone: "All done for today",
  dashboard: "Go to dashboard",
  remove: "Remove from my courses",
  added: "Added to your dashboard.",
  removed: "Removed from your dashboard. Your progress is kept.",
  failed: "That didn't save. Check your connection, then try again.",
} as const

/** What comes next in an added course: the dashboard's own rule (`courseAction`). */
type NextStep = { mode: "review" | "learn"; count: number }

export type OverviewViewer =
  | { signedIn: false }
  /** `next` is `null` when nothing waits today, `undefined` while it loads. */
  | { signedIn: true; next: NextStep | null | undefined }

/** What the last button did, so the page can say so. */
export type OverviewOutcome = "added" | "removed" | "failed"

const mainButtonClass = cn(
  buttonVariants({ variant: "cta", size: "touch-xl" }),
  "w-full sm:w-auto sm:min-w-60"
)
const quietButtonClass = cn(
  buttonVariants({ variant: "outline", size: "touch-xl" }),
  "w-full sm:w-auto"
)

/**
 * The overview's buttons (#174). A visitor gets one: Start learning, through
 * sign-up. A learner can start, add, continue or remove.
 */
export function OverviewActions({
  courseId,
  added,
  viewer,
  outcome,
  pending,
  onStart,
  onAdd,
  onRemove,
}: {
  courseId: string
  added: boolean
  viewer: OverviewViewer
  outcome: OverviewOutcome | null
  pending: boolean
  onStart: () => void
  onAdd: () => void
  onRemove: () => void
}): JSX.Element {
  const { plural } = useFormatters()

  if (!viewer.signedIn) {
    return (
      <div className="flex flex-col items-stretch gap-2 sm:items-start">
        {/* Sign-up returns here, to the course's first words, not the dashboard. */}
        <Link
          to="/signup"
          search={{ redirect: `/study/${courseId}?mode=learn` }}
          className={mainButtonClass}
        >
          {messages.start}
        </Link>
        <Text variant="muted">{messages.signUpFirst}</Text>
      </div>
    )
  }

  const message =
    outcome === null ? null : (
      <p
        role={outcome === "failed" ? "alert" : "status"}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-foreground"
      >
        <span className="inline-flex items-center gap-1.5 font-semibold">
          {outcome === "failed" ? (
            <Info aria-hidden="true" className="size-4 text-destructive" />
          ) : (
            <Check aria-hidden="true" className="size-4 text-success" />
          )}
          {messages[outcome]}
        </span>
        {outcome === "added" ? (
          <Link
            to="/dashboard"
            className="inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
          >
            {messages.dashboard}
          </Link>
        ) : null}
      </p>
    )

  if (!added) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="cta"
            size="touch-xl"
            className={mainButtonClass}
            disabled={pending}
            onClick={onStart}
          >
            {messages.start}
          </Button>
          <Button
            variant="outline"
            size="touch-xl"
            className={quietButtonClass}
            disabled={pending}
            onClick={onAdd}
          >
            {messages.add}
          </Button>
        </div>
        {message}
      </div>
    )
  }

  const { next } = viewer
  return (
    <div className="flex flex-col gap-3">
      {next === null ? (
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <p className="inline-flex items-center gap-1.5 text-base font-semibold text-foreground">
            <Check aria-hidden="true" className="size-4 text-success" />
            {messages.allDone}
          </p>
          <Link to="/dashboard" className={quietButtonClass}>
            {messages.dashboard}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Link
            to="/study/$courseId"
            params={{ courseId }}
            // Until the counts arrive, review: the session says if nothing is waiting.
            search={{ mode: next?.mode ?? "review" }}
            className={mainButtonClass}
          >
            {messages.continue}
          </Link>
          {next === undefined ? null : (
            <Text className="tabular-nums">
              {plural(
                next.count,
                next.mode === "review" ? messages.toReview : messages.newWords
              )}
            </Text>
          )}
        </div>
      )}
      {message}
      <Button
        variant="ghost"
        size="touch"
        // Text lines up with the page; the hover background still has its padding.
        className="-ms-4 self-start text-muted-foreground"
        disabled={pending}
        onClick={onRemove}
      >
        {messages.remove}
      </Button>
    </div>
  )
}
