import { useMemo } from "react"
import { useViewer } from "@/components/session-provider"

type MessageValues = Record<string, string | number>

/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

export type Formatters = {
  number: (value: number) => string
  /** `ratio` is 0–1, so 0.05 formats as "5%". */
  percent: (ratio: number) => string
  /** Name of a BCP 47 language in the UI locale, e.g. "es" → "Spanish". */
  languageName: (tag: string) => string
  /** "2 hours ago", "yesterday". Past and future both work. */
  relativeTime: (date: Date, now: Date) => string
  format: (template: string, values?: MessageValues) => string
  plural: (
    count: number,
    forms: PluralMessage,
    values?: MessageValues
  ) => string
}

const relativeUnits = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
] as const satisfies readonly (readonly [Intl.RelativeTimeFormatUnit, number])[]

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return values[key] ?? match
  })
}

function createFormatters(locale: string): Formatters {
  const numberFormat = new Intl.NumberFormat(locale)
  const percentFormat = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  })
  const pluralRules = new Intl.PluralRules(locale)
  const languageNames = new Intl.DisplayNames(locale, { type: "language" })
  const relativeFormat = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  })

  const number = (value: number): string => numberFormat.format(value)

  const percent = (ratio: number): string => percentFormat.format(ratio)

  const languageName = (tag: string): string => languageNames.of(tag) ?? tag

  const relativeTime = (date: Date, now: Date): string => {
    const seconds = (date.getTime() - now.getTime()) / 1000
    for (const [unit, size] of relativeUnits) {
      if (Math.abs(seconds) >= size) {
        return relativeFormat.format(Math.round(seconds / size), unit)
      }
    }
    return relativeFormat.format(0, "minute")
  }

  const format = (template: string, values: MessageValues = {}): string => {
    const formatted = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "number" ? number(value) : value,
      ])
    )
    return interpolate(template, formatted)
  }

  const plural = (
    count: number,
    forms: PluralMessage,
    values: MessageValues = {}
  ): string => {
    const template = forms[pluralRules.select(count)] ?? forms.other
    return format(template, { count, ...values })
  }

  return { number, percent, languageName, relativeTime, format, plural }
}

export function useFormatters(): Formatters {
  const { uiLocale } = useViewer()
  return useMemo(() => createFormatters(uiLocale), [uiLocale])
}
