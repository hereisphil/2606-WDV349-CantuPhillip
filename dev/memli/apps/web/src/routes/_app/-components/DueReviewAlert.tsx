import { Fragment, type JSX, type ReactNode } from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"

export type DueReviewData = {
  dueCount: number
}

type DueReviewAlertProps = DueReviewData & {
  termsLearned: number
  stats?: ReactNode
}

const messages = {
  badge: "Learning overview",
  heading: "You have {count} due for review today.",
  dueCards: {
    one: "{count} card",
    other: "{count} cards",
  },
  masteredDetail: {
    one: "Maintain your streak by completing your daily goal. You've mastered {count} term so far!",
    other:
      "Maintain your streak by completing your daily goal. You've mastered {count} terms so far!",
  },
  button: "Start reviewing",
} as const

/**
 * Selects the plural form and interpolates `{count}`.
 * Replace with your shared `plural()` helper if already defined in your i18n utilities.
 */
function plural(
  forms: { readonly one: string; readonly other: string },
  count: number
): string {
  const rule = new Intl.PluralRules("en").select(count)
  const template = rule === "one" ? forms.one : forms.other
  return template.replaceAll("{count}", String(count))
}

/**
 * Interpolates ReactNodes into a whole-sentence template so translators
 * can freely reorder `{placeholder}` tokens without breaking JSX styling.
 */
function formatRichText(
  template: string,
  values: Record<string, ReactNode>
): ReactNode {
  const parts = template.split(/(\{[a-zA-Z0-9_]+\})/g)
  return parts.map((part, index) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      const key = part.slice(1, -1)
      if (key in values) {
        return <Fragment key={index}>{values[key]}</Fragment>
      }
    }
    return part
  })
}

export function DueReviewAlert({
  dueCount,
  termsLearned,
  stats,
}: DueReviewAlertProps): JSX.Element {
  const countLabel = plural(messages.dueCards, dueCount)

  return (
    <div
      role="status"
      className="flex flex-col gap-4 rounded-xl bg-accent px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col items-start gap-2">
        <Badge variant="secondary" className="bg-card text-primary uppercase">
          <Sparkles aria-hidden="true" />
          {messages.badge}
        </Badge>
        <Heading level={2} size="3">
          {formatRichText(messages.heading, {
            count: <span className="text-primary">{countLabel}</span>,
          })}
        </Heading>
        <Text variant="small">
          {plural(messages.masteredDetail, termsLearned)}
        </Text>
        {/* Study sessions open at /study/$courseId (#48). */}
        <Button type="button" size="lg">
          {messages.button}
        </Button>
      </div>
      {stats}
    </div>
  )
}
