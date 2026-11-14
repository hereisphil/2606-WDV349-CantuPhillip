// Reads the color roles out of globals.css and measures pairs of them, so the
// contrast test checks the exact values the app ships.
import { APCAcontrast, sRGBtoY } from "apca-w3"
import {
  displayable,
  formatHex,
  interpolate,
  parse,
  toGamut,
  wcagContrast,
  type Color,
} from "culori"

export type Theme = "light" | "dark"

type Declarations = Record<string, string>

export type ThemeTokens = Record<Theme, Declarations>

export type Measurement = {
  foreground: string
  background: string
  /** WCAG 2.x contrast ratio, from 1 to 21. */
  ratio: number
  /** APCA lightness contrast. Signed: negative means light text on a dark background. */
  lc: number
}

const toSrgb = toGamut("rgb", "oklch")

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

function declarationsIn(body: string): Declarations {
  const declarations: Declarations = {}
  for (const match of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name !== undefined && value !== undefined) {
      declarations[name] = value.replace(/\s+/g, " ").trim()
    }
  }
  return declarations
}

/** Declarations in the top-level blocks whose selector is exactly `selector`. */
function blocksFor(css: string, selector: string): Declarations {
  const escaped = selector.replace(/\./g, "\\.")
  const pattern = new RegExp(`^${escaped} \\{([^}]*)\\}`, "gm")
  let declarations: Declarations = {}
  for (const match of css.matchAll(pattern)) {
    declarations = { ...declarations, ...declarationsIn(match[1] ?? "") }
  }
  return declarations
}

/**
 * The custom properties each theme sees on `<html>`. Dark starts from every
 * `:root` value and overrides it with `.dark`, as the cascade does. Blocks
 * nested inside `@media` are indented, so they are not read.
 */
export function readThemeTokens(css: string): ThemeTokens {
  const clean = stripComments(css)
  const light = blocksFor(clean, ":root")
  return { light, dark: { ...light, ...blocksFor(clean, ".dark") } }
}

function resolveValue(
  value: string,
  tokens: Declarations,
  seen: readonly string[]
): Color {
  const reference = /^var\(\s*--([\w-]+)\s*\)$/.exec(value)
  if (reference?.[1] !== undefined) {
    return resolveToken(reference[1], tokens, seen)
  }

  const mix =
    /^color-mix\(\s*in oklab\s*,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+)\)$/.exec(
      value
    )
  if (mix?.[1] !== undefined && mix[2] !== undefined && mix[3] !== undefined) {
    const first = resolveValue(mix[1].trim(), tokens, seen)
    const second = resolveValue(mix[3].trim(), tokens, seen)
    const share = Number(mix[2]) / 100
    return interpolate([second, first], "oklab")(share)
  }

  const color = parse(value)
  if (color === undefined) {
    throw new Error(`Cannot read the color "${value}"`)
  }
  return color
}

/** Follows `var()` references and `color-mix()` until it reaches a color. */
export function resolveToken(
  name: string,
  tokens: Declarations,
  seen: readonly string[] = []
): Color {
  if (seen.includes(name)) {
    throw new Error(`Circular reference: ${[...seen, name].join(" -> ")}`)
  }
  const value = tokens[name]
  if (value === undefined) {
    throw new Error(`--${name} is not defined`)
  }
  return resolveValue(value, tokens, [...seen, name])
}

/** The sRGB color a browser shows for `color`, as an 8-bit hex string. */
function toHex(color: Color): string {
  return formatHex(toSrgb(color))
}

/** Whether `color` fits the sRGB gamut without losing chroma. */
export function fitsSrgb(color: Color): boolean {
  return displayable(color)
}

function rgb8(hex: string): number[] {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
}

/** WCAG and APCA contrast between two roles in one theme. */
export function measure(
  tokens: Declarations,
  foreground: string,
  background: string
): Measurement {
  const fg = toHex(resolveToken(foreground, tokens))
  const bg = toHex(resolveToken(background, tokens))
  return {
    foreground: fg,
    background: bg,
    ratio: wcagContrast(fg, bg),
    lc: Number(APCAcontrast(sRGBtoY(rgb8(fg)), sRGBtoY(rgb8(bg)))),
  }
}
