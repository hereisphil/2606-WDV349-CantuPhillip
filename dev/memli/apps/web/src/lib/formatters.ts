import { useMemo } from "react"
import { useViewer } from "@/components/session-provider"

type MessageValues = Record<string, string | number>

/** Plural forms keyed by `Intl.PluralRules` category. `other` is always required. */
type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

export type Formatters = {
  number: (value: number) => string
  format: (template: string, values?: MessageValues) => string
  plural: (
    count: number,
    forms: PluralMessage,
    values?: MessageValues
  ) => string
}

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return values[key] ?? match
  })
}

function createFormatters(locale: string): Formatters {
  const numberFormat = new Intl.NumberFormat(locale)
  const pluralRules = new Intl.PluralRules(locale)

  const number = (value: number): string => numberFormat.format(value)

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

  return { number, format, plural }
}

export function useFormatters(): Formatters {
  const { uiLocale } = useViewer()
  return useMemo(() => createFormatters(uiLocale), [uiLocale])
}
