// Verifies the proposed tokens: sRGB gamut, WCAG 2.x contrast ratio, APCA Lc.
// Run: node verify.mjs            (prints Markdown)
//      node verify.mjs --json     (also writes results.json)
import fs from 'node:fs'
import { prim, primMeta, light, dark, css, rampNames, rampSteps } from './tokens.mjs'
import { pair, resolve, f2, f1 } from './lib.mjs'

// Thresholds. kind -> [min WCAG ratio, min |APCA Lc|]
const T = {
  body:     [7.0, 90],  // primary reading text and headings. WCAG 1.4.6 AAA 7:1; APCA "preferred" Lc 90.
  bodyTint: [7.0, 75],  // short reading text on tinted, sunken or overlay surfaces (chips, popovers, soft hero).
  muted:    [4.5, 75],  // secondary text at 14-16px. WCAG 1.4.3 AA; APCA Lc 75 = min for body-size text.
  muted2:   [4.5, 60],  // secondary text on tinted/sunken surfaces. WCAG AA; APCA Lc 60 = min content text.
  label:    [4.5, 75],  // button labels (16px, weight 600). APCA Lc 75 covers 16px/500.
  label2:   [4.5, 60],  // transient states (pressed) and 16px/700 labels.
  colored:  [4.5, 60],  // colored text: links, status words, eyebrows (must be >=16px/600 or paired with icon).
  large:    [3.0, 45],  // large bold text (>=24px bold). WCAG large-text 3:1; APCA Lc 45.
  nontext:  [3.0, 30],  // UI boundaries, icons, focus rings, chart marks. WCAG 1.4.11; APCA Lc 30.
  deco:     [0, 0],     // decorative only (hairlines, surface steps). Reported, not gated.
}
// [label, fg role, bg role, kind]
const common = [
  ['Heading / numeral on page', 'foreground-strong', 'background', 'body'],
  ['Heading / numeral on card', 'foreground-strong', 'card', 'body'],
  ['Body text on page', 'foreground', 'background', 'body'],
  ['Body text on card', 'foreground', 'card', 'body'],
  ['Body text on sidebar', 'foreground', 'sidebar', 'body'],
  ['Body text on popover', 'foreground', 'popover', 'bodyTint'],
  ['Body text on chip (muted)', 'foreground', 'muted', 'bodyTint'],
  ['Muted text on page', 'muted-foreground', 'background', 'muted'],
  ['Muted text on card', 'muted-foreground', 'card', 'muted'],
  ['Muted text on sidebar', 'muted-foreground', 'sidebar', 'muted'],
  ['Muted text on popover', 'muted-foreground', 'popover', 'muted2'],
  ['Muted text on chip (muted)', 'muted-foreground', 'muted', 'muted2'],
  ['Selected label on accent tint', 'accent-foreground', 'accent', 'label'],
  ['Selected border / brand icon vs card', 'brand', 'card', 'nontext'],
  ['Selected border / brand icon vs page', 'brand', 'background', 'nontext'],
  ['Link on page', 'link', 'background', 'colored'],
  ['Link on card', 'link', 'card', 'colored'],
  ['Hero text on hero', 'hero-foreground', 'hero', 'body'],
  ['Hero secondary text on hero', 'hero-muted-foreground', 'hero', 'muted'],
  ['Hero chip text on hero chip', 'hero-foreground', 'hero-chip', 'bodyTint'],
  ['Hero hairline vs hero', 'hero-border', 'hero', 'deco'],
  ['Primary (brand) button label on fill', 'primary-foreground', 'primary', 'label'],
  ['Primary (brand) button label on hover fill', 'primary-foreground', 'primary-hover', 'label'],
  ['text-primary on card (existing usages)', 'primary', 'card', 'colored'],
  ['text-primary on page (existing usages)', 'primary', 'background', 'colored'],
  ['B: CTA label on fill', 'cta-foreground', 'cta', 'label'],
  ['B: CTA label on hover fill', 'cta-foreground', 'cta-hover', 'label'],
  ['B: CTA label on pressed fill', 'cta-foreground', 'cta-active', 'label2'],
  ['B: CTA fill vs hero (stand-out)', 'cta', 'hero', 'nontext'],
  ['B: CTA hover fill vs hero', 'cta-hover', 'hero', 'nontext'],
  ['B: CTA fill vs page (if placed on the page)', 'cta', 'background', 'deco'],
  ['B: CTA fill vs card (if placed on a card)', 'cta', 'card', 'deco'],
  ['B: CTA edge vs card (gives the 3:1 boundary)', 'cta-edge', 'card', 'nontext'],
  ['B: CTA edge vs page', 'cta-edge', 'background', 'nontext'],
  ['A: CTA label on fill', 'ctaA-foreground', 'ctaA', 'label'],
  ['A: CTA label on hover fill', 'ctaA-foreground', 'ctaA-hover', 'label'],
  ['A: CTA label on pressed fill', 'ctaA-foreground', 'ctaA-active', 'label2'],
  ['A: CTA fill vs soft hero (stand-out)', 'ctaA', 'hero-soft', 'deco'],
  ['A: CTA fill vs card (stand-out)', 'ctaA', 'card', 'deco'],
  ['A: CTA fill vs bold hero (fails in light, works in dark)', 'ctaA', 'hero', 'deco'],
  ['A: heading / numeral on soft hero', 'foreground-strong', 'hero-soft', 'body'],
  ['A: body text on soft hero', 'foreground', 'hero-soft', 'bodyTint'],
  ['A: muted text on soft hero', 'muted-foreground', 'hero-soft', 'muted2'],
  ['Focus ring vs page', 'ring', 'background', 'nontext'],
  ['Focus ring vs card', 'ring', 'card', 'nontext'],
  ['Focus ring vs sidebar', 'ring', 'sidebar', 'nontext'],
  ['Focus ring on hero vs hero', 'hero-ring', 'hero', 'nontext'],
  ['A: focus ring vs soft hero', 'ring', 'hero-soft', 'nontext'],
  ['Control border (border-strong) vs card', 'border-strong', 'card', 'nontext'],
  ['Control border (border-strong) vs page', 'border-strong', 'background', 'nontext'],
  ['Control border (border-strong) vs popover', 'border-strong', 'popover', 'nontext'],
  ['Hairline (border) vs card', 'border', 'card', 'deco'],
  ['Hairline (border) vs page', 'border', 'background', 'deco'],
  ['Surface: card vs page', 'card', 'background', 'deco'],
  ['Surface: sidebar vs page', 'sidebar', 'background', 'deco'],
  ['Surface: chip (muted) vs card', 'muted', 'card', 'deco'],
  ['Surface: hero vs page', 'hero', 'background', 'deco'],
  ['Surface: soft hero vs page', 'hero-soft', 'background', 'deco'],
  ['Success text on card', 'success', 'card', 'colored'],
  ['Success text on page', 'success', 'background', 'colored'],
  ['Success container text', 'success-container-foreground', 'success-container', 'muted'],
  ['Warning text on card', 'warning', 'card', 'colored'],
  ['Warning text on page', 'warning', 'background', 'colored'],
  ['Warning container text', 'warning-container-foreground', 'warning-container', 'muted'],
  ['Danger text on card', 'destructive', 'card', 'colored'],
  ['Danger text on page', 'destructive', 'background', 'colored'],
  ['Danger button label on fill', 'destructive-foreground', 'destructive', 'label2'],
  ['Danger container text', 'destructive-container-foreground', 'destructive-container', 'muted'],
  ['Streak flame icon vs card', 'streak', 'card', 'nontext'],
  ['Streak flame icon vs page', 'streak', 'background', 'nontext'],
  ['Viz: mastered vs learning (adjacent)', 'viz-mastered', 'viz-learning', 'nontext'],
  ['Viz: learning vs not started (adjacent)', 'viz-learning', 'viz-new', 'nontext'],
  ['Viz: mastered vs card', 'viz-mastered', 'card', 'nontext'],
  ['Viz: learning vs card', 'viz-learning', 'card', 'nontext'],
  ['Viz: not started / track vs card', 'viz-new', 'card', 'deco'],
  ['Viz: goal ring vs track', 'viz-progress', 'viz-track', 'nontext'],
  ['Viz: goal ring vs card', 'viz-progress', 'card', 'nontext'],
  ['Viz: check mark on filled day', 'viz-on-progress', 'viz-progress', 'nontext'],
  ['Viz A: mastered vs learning (adjacent)', 'vizA-mastered', 'vizA-learning', 'nontext'],
  ['Viz A: learning vs not started (adjacent)', 'vizA-learning', 'viz-new', 'nontext'],
  ['Viz A: goal ring vs track', 'vizA-progress', 'viz-track', 'nontext'],
]
const results = { thresholds: T, themes: {}, gamut: [] }
let fails = 0
const md = []
for (const [name, theme] of [['light', light], ['dark', dark]]) {
  md.push(`\n### ${name.toUpperCase()} theme pairings\n`)
  md.push('| # | Pairing | Foreground | Background | Rule | WCAG | APCA Lc | Pass |')
  md.push('|--:|---|---|---|---|--:|--:|:-:|')
  results.themes[name] = []
  common.forEach(([label, fgRole, bgRole, kind], i) => {
    const p = pair(css(theme, fgRole), css(theme, bgRole))
    const [minR, minLc] = T[kind]
    const ok = p.ratio >= minR && Math.abs(p.lc) >= minLc
    if (!ok) fails++
    const rule = kind === 'deco' ? 'report only' : `${minR}:1, Lc ${minLc}`
    md.push(`| ${i + 1} | ${label} | \`${fgRole}\` ${theme[fgRole].startsWith('mix') ? 'mix' : theme[fgRole]} ${p.fg.hex} | \`${bgRole}\` ${theme[bgRole].startsWith('mix') ? 'mix' : theme[bgRole]} ${p.bg.hex} | ${rule} | ${f2(p.ratio)} | ${f1(p.lc)} | ${kind === 'deco' ? 'n/a' : ok ? 'yes' : '**NO**'} |`)
    results.themes[name].push({ label, fgRole, bgRole, kind, fg: p.fg.hex, bg: p.bg.hex, wcag: +f2(p.ratio), lc: +f1(p.lc), ok })
  })
}
md.push('\n### Primitive ramps (all checked against the sRGB gamut)\n')
for (const ramp of rampNames) {
  md.push(`\n**${ramp}**\n`)
  md.push('| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |')
  md.push('|--:|---|---|:-:|---|')
  for (const step of rampSteps[ramp]) {
    const k = `${ramp}.${step}`; const r = resolve(prim[k]); const m = primMeta[k]
    results.gamut.push({ token: k, css: prim[k], hex: r.hex, inSrgb: r.srgbOk, requestedC: m.requestedC, finalC: m.finalC })
    if (!r.srgbOk) fails++
    md.push(`| ${step} | \`${prim[k]}\` | ${r.hex} | ${r.srgbOk ? 'yes' : '**NO**'} | ${m.reduced ? `yes, ${m.requestedC} -> ${m.finalC}` : 'no'} |`)
  }
}
console.log(md.join('\n'))
console.log(`\nFAILS: ${fails}`)
if (process.argv.includes('--json')) fs.writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify(results, null, 2))
if (process.argv.includes('--md')) fs.writeFileSync(new URL('./results.md', import.meta.url), md.join('\n') + '\n')
