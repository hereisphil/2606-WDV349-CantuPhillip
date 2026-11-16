// Extra evidence for the report: CTA options, color-vision simulation, APCA font-size lookup,
// Albers "one color, many faces" numbers, P3 notes, prefers-contrast overrides.
import { prim, light, dark, css } from './tokens.mjs'
import { pair, resolve, f2, f1, apca } from './lib.mjs'
import { filterDeficiencyProt, filterDeficiencyDeuter, filterDeficiencyTrit, differenceEuclidean, converter, formatHex, wcagContrast, parse, inGamut, displayable } from 'culori'
import { fontLookupAPCA, APCAcontrast, displayP3toY, sRGBtoY } from 'apca-w3'
const toRgb = converter('rgb'), toOk = converter('oklch'), toP3 = converter('p3')
const dE = differenceEuclidean('oklab')
const sims = { protan: filterDeficiencyProt(1), deutan: filterDeficiencyDeuter(1), tritan: filterDeficiencyTrit(1) }
const hexOf = s => resolve(s).hex
const L = k => prim[k]

console.log('## 1. CTA options: label legibility and how far the button stands out\n')
console.log('| Theme | Option | Fill | Label | Label WCAG | Label Lc | Fill vs card | Fill vs page | Fill vs hero used with it |')
console.log('|---|---|---|---|--:|--:|--:|--:|--:|')
const opts = [
  ['light', 'Current (blue, 126px wide)', 'oklch(0.488 0.243 264.376)', 'oklch(1 0 0)', 'oklch(1 0 0)', 'oklch(0.985 0.004 261)', 'oklch(0.971 0.013 264)', 'current pale tint'],
  ['light', 'A: blue.700 + white', L('blue.700'), L('neutral.0'), css(light, 'card'), css(light, 'background'), css(light, 'hero-soft'), 'soft hero blue.100'],
  ['light', 'A3: white + blue.800 label on bold hero', L('neutral.0'), L('blue.800'), css(light, 'card'), css(light, 'background'), css(light, 'hero'), 'bold hero blue.950'],
  ['light', 'B: amber.400 + ink', L('amber.400'), L('neutral.950'), css(light, 'card'), css(light, 'background'), css(light, 'hero'), 'bold hero blue.950'],
  ['light', 'C: orange.600 + white (example-04 style)', L('orange.600'), L('neutral.0'), css(light, 'card'), css(light, 'background'), css(light, 'hero-soft'), 'soft hero blue.100'],
  ['light', 'C2: orange.500 + ink', L('orange.500'), L('neutral.950'), css(light, 'card'), css(light, 'background'), css(light, 'hero'), 'bold hero blue.950'],
  ['dark', 'Current (sky blue + near-black label)', 'oklch(0.697 0.158 264)', 'oklch(0.175 0.025 261)', 'oklch(0.236 0.025 261)', 'oklch(0.175 0.025 261)', 'oklch(0.291 0.025 261)', 'current panel'],
  ['dark', 'A1: blue.700 + near-white (saturated)', L('blue.700'), L('neutral.50'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero-soft'), 'soft hero navy.800'],
  ['dark', 'A2: blue.200 + ink (pale, the verified A)', L('blue.200'), L('navy.950'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero-soft'), 'soft hero navy.800'],
  ['dark', 'A3: blue.100 + blue.950 label on bold hero', L('blue.100'), L('blue.950'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero'), 'bold hero blue.900'],
  ['dark', 'B: amber.300 + ink', L('amber.300'), L('navy.950'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero'), 'bold hero blue.900'],
  ['dark', 'C: orange.600 + white', L('orange.600'), L('neutral.0'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero-soft'), 'soft hero navy.800'],
  ['dark', 'C2: orange.400 + ink', L('orange.400'), L('navy.950'), css(dark, 'card'), css(dark, 'background'), css(dark, 'hero'), 'bold hero blue.900'],
]
for (const [th, name, fill, label, card, page, hero, heroName] of opts) {
  const lab = pair(label, fill), c = pair(fill, card), p = pair(fill, page), h = pair(fill, hero)
  console.log(`| ${th} | ${name} | ${lab.bg.hex} | ${lab.fg.hex} | ${f2(lab.ratio)} | ${f1(lab.lc)} | ${f2(c.ratio)} | ${f2(p.ratio)} | ${f2(h.ratio)} (${heroName} ${h.bg.hex}) |`)
}

console.log('\n## 2. Color-vision simulation (culori filterDeficiency*, severity 1 = full dichromacy)\n')
console.log('WCAG ratio and OKLab distance (dE) between each pair, for normal vision and three simulated deficiencies.\n')
console.log('| Pair | Theme | Normal ratio / dE | Protan | Deutan | Tritan |')
console.log('|---|---|--:|--:|--:|--:|')
function simRow(name, th, a, b) {
  const A = toRgb(parse(hexOf(a))), B = toRgb(parse(hexOf(b)))
  const cell = (x, y) => `${f2(wcagContrast(x, y))} / ${dE(x, y).toFixed(3)}`
  console.log(`| ${name} | ${th} | ${cell(A, B)} | ${cell(sims.protan(A), sims.protan(B))} | ${cell(sims.deutan(A), sims.deutan(B))} | ${cell(sims.tritan(A), sims.tritan(B))} |`)
}
for (const [th, T] of [['light', light], ['dark', dark]]) {
  simRow('B: CTA fill vs bold hero', th, css(T, 'cta'), css(T, 'hero'))
  simRow('A: CTA fill vs card', th, css(T, 'ctaA'), css(T, 'card'))
  simRow('Success text vs danger text', th, css(T, 'success'), css(T, 'destructive'))
  simRow('Success text vs warning text', th, css(T, 'success'), css(T, 'warning'))
  simRow('Warning text vs danger text', th, css(T, 'warning'), css(T, 'destructive'))
  simRow('Streak orange vs CTA amber', th, css(T, 'streak'), css(T, 'cta'))
  simRow('Viz mastered vs learning', th, css(T, 'viz-mastered'), css(T, 'viz-learning'))
  simRow('Viz learning vs not started', th, css(T, 'viz-learning'), css(T, 'viz-new'))
  simRow('Link vs body text', th, css(T, 'link'), css(T, 'foreground'))
}
console.log('\nSimulated colors (hex) of the three status text colors:')
for (const [th, T] of [['light', light], ['dark', dark]]) for (const r of ['success', 'warning', 'destructive']) {
  const c = toRgb(parse(hexOf(css(T, r))))
  const o = x => { const k = toOk(x); return `${formatHex(x)} L=${k.l.toFixed(2)}` }
  console.log(`  ${th} ${r.padEnd(12)} normal ${o(c)} | protan ${o(sims.protan(c))} | deutan ${o(sims.deutan(c))} | tritan ${o(sims.tritan(c))}`)
}

console.log('\n## 3. APCA font lookup: smallest font size (px) allowed at each measured Lc\n')
console.log('fontLookupAPCA(Lc) from apca-w3 returns the minimum px size per weight. 999 = too low to use; 777 = non-text only.\n')
console.log('| Text role | Theme | Surface | Lc | min px @400 | @500 | @600 | @700 |')
console.log('|---|---|---|--:|--:|--:|--:|--:|')
function fontRow(name, th, fg, bg, surf) { const p = pair(fg, bg); const a = fontLookupAPCA(p.lc); console.log(`| ${name} | ${th} | ${surf} | ${f1(p.lc)} | ${a[4]} | ${a[5]} | ${a[6]} | ${a[7]} |`) }
fontRow('CURRENT muted-foreground', 'light', 'oklch(0.491 0.032 261)', 'oklch(1 0 0)', 'card')
fontRow('CURRENT muted-foreground', 'light', 'oklch(0.491 0.032 261)', 'oklch(0.971 0.013 264)', 'Today panel')
fontRow('CURRENT muted-foreground', 'light', 'oklch(0.491 0.032 261)', 'oklch(0.962 0.007 261)', 'chip / trend tile')
fontRow('CURRENT muted-foreground', 'dark', 'oklch(0.68 0.025 261)', 'oklch(0.236 0.025 261)', 'card')
fontRow('CURRENT muted-foreground', 'dark', 'oklch(0.68 0.025 261)', 'oklch(0.291 0.025 261)', 'Today panel / chip')
fontRow('CURRENT CTA label', 'dark', 'oklch(0.175 0.025 261)', 'oklch(0.697 0.158 264)', 'sky blue fill')
for (const [th, T] of [['light', light], ['dark', dark]]) {
  fontRow('foreground', th, css(T, 'foreground'), css(T, 'card'), 'card')
  fontRow('foreground', th, css(T, 'foreground'), css(T, 'background'), 'page')
  fontRow('muted-foreground', th, css(T, 'muted-foreground'), css(T, 'card'), 'card')
  fontRow('muted-foreground', th, css(T, 'muted-foreground'), css(T, 'background'), 'page')
  fontRow('muted-foreground', th, css(T, 'muted-foreground'), css(T, 'muted'), 'chip')
  fontRow('hero-muted-foreground', th, css(T, 'hero-muted-foreground'), css(T, 'hero'), 'hero')
  fontRow('link', th, css(T, 'link'), css(T, 'card'), 'card')
  fontRow('success', th, css(T, 'success'), css(T, 'card'), 'card')
  fontRow('warning', th, css(T, 'warning'), css(T, 'card'), 'card')
  fontRow('destructive', th, css(T, 'destructive'), css(T, 'card'), 'card')
  fontRow('B CTA label', th, css(T, 'cta-foreground'), css(T, 'cta'), 'amber fill')
  fontRow('A CTA label', th, css(T, 'ctaA-foreground'), css(T, 'ctaA'), 'blue fill')
}

console.log('\n## 4. Albers in numbers: one color, many faces\n')
console.log('| Same color | Placed on | WCAG vs that surface | APCA Lc |')
console.log('|---|---|--:|--:|')
const faces = [
  ['brand blue #1447e6 (blue.700)', L('blue.700'), [['white card', L('neutral.0')], ['soft tint blue.100', L('blue.100')], ['dark card navy.850', L('navy.850')], ['bold hero blue.900', L('blue.900')]]],
  ['amber.400 CTA fill', L('amber.400'), [['white card', L('neutral.0')], ['light page neutral.100', L('neutral.100')], ['bold hero blue.950', L('blue.950')], ['dark page navy.900', L('navy.900')]]],
  ['light muted text neutral.700', L('neutral.700'), [['white card', L('neutral.0')], ['page neutral.100', L('neutral.100')], ['chip neutral.200', L('neutral.200')], ['soft tint blue.100', L('blue.100')], ['success container green.100', L('green.100')], ['warning container orange.100', L('orange.100')]]],
  ['chip fill neutral.200', L('neutral.200'), [['white card', L('neutral.0')], ['page neutral.100', L('neutral.100')], ['soft tint blue.100', L('blue.100')]]],
  ['mid gray border neutral.600', L('neutral.600'), [['white card', L('neutral.0')], ['dark card navy.850', L('navy.850')], ['bold hero blue.950', L('blue.950')]]],
]
for (const [name, c, list] of faces) for (const [sn, s] of list) { const p = pair(c, s); console.log(`| ${name} | ${sn} | ${f2(p.ratio)} | ${f1(p.lc)} |`) }

console.log('\n## 5. Alpha tints inherit their surround (why "bg-success/10" is not one color)\n')
import { over } from './lib.mjs'
console.log('| Tint | Over surface | Resulting hex | Text on it | WCAG | Lc |')
console.log('|---|---|---|---|--:|--:|')
for (const [th, T] of [['light', light], ['dark', dark]]) for (const role of ['success', 'destructive']) for (const surf of ['card', 'background', 'muted']) {
  const base = css(T, role); const tint = base.replace(')', ' / 12%)')
  const res = formatHex(over(tint, css(T, surf)))
  const p = pair(base, res)
  console.log(`| ${th} ${role} at 12% | ${surf} | ${res} | ${role} text | ${f2(p.ratio)} | ${f1(p.lc)} |`)
}

console.log('\n## 6. P3: do any proposed tokens need it? Would it help?\n')
const inP3 = inGamut('p3')
let out = 0; for (const [k, v] of Object.entries(prim)) if (!displayable(parse(v))) out++
console.log(`Primitives outside sRGB: ${out} of ${Object.keys(prim).length}`)
for (const [name, base, boosted] of [['amber.400 CTA', L('amber.400'), 'oklch(0.855 0.19 88)'], ['orange.500 streak', L('orange.500'), 'oklch(0.70 0.21 50)'], ['green.500', L('green.500'), 'oklch(0.70 0.19 160)'], ['blue.700 brand', L('blue.700'), 'oklch(0.488 0.27 264.376)']]) {
  const b = parse(boosted); const p3 = toP3(b)
  const Yp3 = displayP3toY([p3.r, p3.g, p3.b].map(v => Math.min(1, Math.max(0, v))))
  const r = resolve(base); const Ys = sRGBtoY(r.rgb8)
  console.log(`  ${name}: sRGB token ${base} (${r.hex}). P3 candidate ${boosted}: in sRGB ${displayable(b)}, in P3 ${inP3(b)}; sRGB fallback after chroma reduction ${resolve(boosted).mappedOklch} ${resolve(boosted).hex}; luminance Y sRGB token ${Ys.toFixed(4)} vs P3 candidate ${Yp3.toFixed(4)}`)
}

console.log('\n## 7. prefers-contrast: more overrides\n')
console.log('| Override | Theme | WCAG | Lc |')
console.log('|---|---|--:|--:|')
for (const [th, T] of [['light', light], ['dark', dark]]) {
  const rows = [
    ['muted-foreground := foreground, on card', css(T, 'foreground'), css(T, 'card')],
    ['muted-foreground := foreground, on chip', css(T, 'foreground'), css(T, 'muted')],
    ['border := border-strong, vs card', css(T, 'border-strong'), css(T, 'card')],
    ['border-strong := foreground, vs card', css(T, 'foreground'), css(T, 'card')],
    ['ring := foreground-strong, vs card', css(T, 'foreground-strong'), css(T, 'card')],
  ]
  for (const [n, a, b] of rows) { const p = pair(a, b); console.log(`| ${n} | ${th} | ${f2(p.ratio)} | ${f1(p.lc)} |`) }
}

console.log('\n## 8. Surface lightness steps (OKLCH L) current vs proposed\n')
console.log('| Theme | Step | Current L (delta) | Proposed L (delta) |')
console.log('|---|---|---|---|')
const Lof = s => toOk(parse(s)).l, Cof = s => toOk(parse(s)).c
const cur = { light: { page: 0.985, card: 1, panel: 0.971, chip: 0.962 }, dark: { page: 0.175, card: 0.236, panel: 0.291, chip: 0.291 } }
for (const [th, T] of [['light', light], ['dark', dark]]) {
  const p = { page: Lof(css(T, 'background')), card: Lof(css(T, 'card')), chip: Lof(css(T, 'muted')), hero: Lof(css(T, 'hero')), sidebar: Lof(css(T, 'sidebar')) }
  console.log(`| ${th} | page -> card | ${cur[th].page} -> ${cur[th].card} (${Math.abs(cur[th].card - cur[th].page).toFixed(3)}) | ${p.page} -> ${p.card} (${Math.abs(p.card - p.page).toFixed(3)}) |`)
  console.log(`| ${th} | page -> hero panel | ${cur[th].page} -> ${cur[th].panel} (${Math.abs(cur[th].panel - cur[th].page).toFixed(3)}) | ${p.page} -> ${p.hero} (${Math.abs(p.hero - p.page).toFixed(3)}) |`)
  console.log(`| ${th} | card -> chip | ${cur[th].card} -> ${cur[th].chip} (${Math.abs(cur[th].chip - cur[th].card).toFixed(3)}) | ${p.card} -> ${p.chip} (${Math.abs(p.chip - p.card).toFixed(3)}) |`)
  console.log(`| ${th} | page -> sidebar | ${cur[th].page} -> ${th === 'light' ? 0.962 : 0.236} | ${p.page} -> ${p.sidebar} (${Math.abs(p.sidebar - p.page).toFixed(3)}) |`)
}
console.log('\nHue distance CTA amber vs hero: light', Math.abs(toOk(parse(css(light, 'cta'))).h - toOk(parse(css(light, 'hero'))).h).toFixed(0), 'deg; dark', Math.abs(toOk(parse(css(dark, 'cta'))).h - toOk(parse(css(dark, 'hero'))).h).toFixed(0), 'deg')
