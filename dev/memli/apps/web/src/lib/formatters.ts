import { Fragment, createElement, useMemo, type ReactNode } from "react"
import { useViewer } from "@/components/session-provider"

type MessageValues = Record<string, string | number>

/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

/** Renderers for `<tag>…</tag>` in a template, the same syntax react-intl and next-intl use. */
type RichTags = Record<string, (chunk: string) => ReactNode>

export type Formatters = {
  number: (value: number) => string
  /** `ratio` is 0–1, so 0.05 formats as "5%". */
  percent: (ratio: number) => string
  /** Name of a BCP 47 language in the UI locale, e.g. "es" → "Spanish". */
  languageName: (tag: string) => string
  /** "2 hours ago", "yesterday". Past and future both work. */
  relativeTime: (date: Date, now: Date) => string
  /** "M" (narrow) or "Monday" (long). */
  weekday: (date: Date, width: "narrow" | "long") => string
  /** 1 = Monday … 7 = Sunday, from the UI locale's region. */
  firstDayOfWeek: number
  format: (template: string, values?: MessageValues) => string
  plural: (
    count: number,
    forms: PluralMessage,
    values?: MessageValues
  ) => string
  /**
   * Like `format`, or `plural` when given plural forms (using `values.count`),
   * but renders `<tag>…</tag>` through `tags`. Tags don't nest.
   */
  rich: (
    message: string | PluralMessage,
    tags: RichTags,
    values?: MessageValues
  ) => ReactNode[]
}

const tagPattern = /<(\w+)>(.*?)<\/\1>/g

const relativeUnits = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
] as const satisfies readonly (readonly [Intl.RelativeTimeFormatUnit, number])[]

type WeekInfoLocale = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number }
  weekInfo?: { firstDay: number }
}

// Intl.Locale week info is not in every engine yet (Firefox lacks it); Monday is the ISO default.
function localeFirstDay(locale: string): number {
  const info = new Intl.Locale(locale) as WeekInfoLocale
  return (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 1
}

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

  const weekdayFormats = {
    narrow: new Intl.DateTimeFormat(locale, { weekday: "narrow" }),
    long: new Intl.DateTimeFormat(locale, { weekday: "long" }),
  }

  const weekday = (date: Date, width: "narrow" | "long"): string =>
    weekdayFormats[width].format(date)

  const firstDayOfWeek = localeFirstDay(locale)

  const format = (template: string, values: MessageValues = {}): string => {
    const formatted = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "number" ? number(value) : value,
      ])
    )
    return interpolate(template, formatted)
  }

  const selectPlural = (count: number, forms: PluralMessage): string =>
    forms[pluralRules.select(count)] ?? forms.other

  const plural = (
    count: number,
    forms: PluralMessage,
    values: MessageValues = {}
  ): string => format(selectPlural(count, forms), { count, ...values })

  const rich = (
    message: string | PluralMessage,
    tags: RichTags,
    values: MessageValues = {}
  ): ReactNode[] => {
    const template =
      typeof message === "string"
        ? message
        : selectPlural(Number(values.count ?? 0), message)
    const nodes: ReactNode[] = []
    let last = 0
    for (const match of template.matchAll(tagPattern)) {
      const [whole, tag = "", inner = ""] = match
      if (match.index > last) {
        nodes.push(format(template.slice(last, match.index), values))
      }
      const render = tags[tag]
      const text = format(inner, values)
      nodes.push(
        render
          ? createElement(Fragment, { key: match.index }, render(text))
          : text
      )
      last = match.index + whole.length
    }
    if (last < template.length) {
      nodes.push(format(template.slice(last), values))
    }
    return nodes
  }

  return {
    number,
    percent,
    languageName,
    relativeTime,
    weekday,
    firstDayOfWeek,
    format,
    plural,
    rich,
  }
}

export function useFormatters(): Formatters {
  const { uiLocale } = useViewer()
  return useMemo(() => createFormatters(uiLocale), [uiLocale])
}
