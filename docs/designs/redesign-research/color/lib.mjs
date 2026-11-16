// Shared helpers: OKLCH string -> sRGB (with gamut report), WCAG 2.x ratio, APCA Lc.
import { parse, converter, displayable, toGamut, formatHex, wcagContrast, clampRgb, inGamut } from 'culori'
import { APCAcontrast, sRGBtoY } from 'apca-w3'

const toRgb = converter('rgb')
const toOklch = converter('oklch')
const toP3 = converter('p3')
const mapToSrgb = toGamut('rgb', 'oklch') // CSS Color 4 style: hold L and H, reduce chroma
const inP3 = inGamut('p3')

/** Composite a (possibly translucent) color over an opaque backdrop, in sRGB like browsers do. */
export function over(fgStr, bgStr) {
  const f = toRgb(parse(fgStr)); const b = toRgb(mapToSrgb(parse(bgStr)))
  const a = f.alpha ?? 1
  const ff = toRgb(mapToSrgb({ ...f, alpha: 1 }))
  return { mode: 'rgb', r: ff.r * a + b.r * (1 - a), g: ff.g * a + b.g * (1 - a), b: ff.b * a + b.b * (1 - a) }
}

/** Resolve a CSS color string to the 8-bit sRGB color a browser on an sRGB screen shows. */
export function resolve(str, backdrop) {
  const c = parse(str)
  if (!c) throw new Error('cannot parse ' + str)
  const hasAlpha = c.alpha !== undefined && c.alpha < 1
  const opaque = { ...c, alpha: undefined }
  const srgbOk = displayable(opaque)
  const mapped = hasAlpha ? over(str, backdrop) : toRgb(mapToSrgb(opaque))
  const naive = toRgb(clampRgb(opaque))
  const hex = formatHex(mapped)
  const rgb8 = [mapped.r, mapped.g, mapped.b].map(v => Math.round(Math.min(1, Math.max(0, v)) * 255))
  const m = toOklch(mapped)
  return {
    str, hex, rgb8, srgbOk, p3Ok: inP3(opaque),
    naiveClipHex: formatHex(naive),
    mappedOklch: `oklch(${m.l.toFixed(3)} ${m.c.toFixed(3)} ${(m.h ?? 0).toFixed(1)})`,
  }
}

export function wcag(fgHex, bgHex) { return wcagContrast(fgHex, bgHex) }

/** APCA Lc (signed: positive = dark text on light bg, negative = light text on dark bg). */
export function apca(fgRgb8, bgRgb8) { return Number(APCAcontrast(sRGBtoY(fgRgb8), sRGBtoY(bgRgb8))) }

export function pair(fgStr, bgStr) {
  const bg = resolve(bgStr)
  const fg = resolve(fgStr, bgStr)
  return { fg, bg, ratio: wcag(fg.hex, bg.hex), lc: apca(fg.rgb8, bg.rgb8) }
}
export const f2 = n => n.toFixed(2)
export const f1 = n => n.toFixed(1)
