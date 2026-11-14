import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { Lightbulb } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { Tip } from "./dashboard-model"

const messages = {
  tricky: {
    heading: {
      one: "<n>{count}</n> tricky word in <c>{course}</c>",
      other: "<n>{count}</n> tricky words in <c>{course}</c>",
    },
    detail: "A new memory trick can help.",
    practice: "Practice",
    practiceLabel: {
      one: "Practice {count} tricky word in {course}",
      other: "Practice {count} tricky words in {course}",
    },
  },
  study: {
    heading: "Study tip",
    // A draft until approved. More tips can join it; the card shows one at a time.
    detail: "Short daily reviews work better than one long one.",
  },
} as const

const richTags = {
  n: (text: string) => <span className="tabular-nums">{text}</span>,
  c: (text: string) => <span className="wrap-break-word">{text}</span>,
}

/**
 * One warm aside: the tricky words in one course with a Practice link, or a
 * study tip when there are none. An even warm outline and fill set it apart
 * from the page; no side is heavier than the others.
 */
export function TipCard({ tip }: { tip: Tip }): JSX.Element {
  const { rich, plural } = useFormatters()

  return (
    <section
      aria-labelledby="tip-heading"
      className="flex flex-col gap-3 rounded-xl border border-warning-container-border bg-warning-container p-5 text-warning-container-foreground"
    >
      <div className="flex items-start gap-2">
        <Lightbulb
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-warning"
        />
        <h2
          id="tip-heading"
          className="font-heading text-base font-semibold text-pretty"
        >
          {tip.kind === "tricky"
            ? rich(messages.tricky.heading, richTags, {
                count: tip.course.trickyCount,
                course: tip.course.title,
              })
            : messages.study.heading}
        </h2>
      </div>
      <p className="text-base">
        {tip.kind === "tricky" ? messages.tricky.detail : messages.study.detail}
      </p>
      {tip.kind === "tricky" ? (
        <Link
          to="/study/$courseId"
          params={{ courseId: tip.course.courseId }}
          search={{ mode: "practice" }}
          aria-label={plural(
            tip.course.trickyCount,
            messages.tricky.practiceLabel,
            { course: tip.course.title }
          )}
          className={cn(
            buttonVariants({ variant: "outline", size: "touch" }),
            "self-start bg-card dark:bg-transparent"
          )}
        >
          {messages.tricky.practice}
        </Link>
      ) : null}
    </section>
  )
}
