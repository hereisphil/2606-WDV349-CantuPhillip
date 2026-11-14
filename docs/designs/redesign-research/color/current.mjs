// Diagnoses the CURRENT globals.css palette (values copied verbatim from
// dev/memli/packages/ui/src/styles/globals.css lines 68-147).
import { pair, resolve, f2, f1 } from './lib.mjs'
const L = {
  background: 'oklch(0.985 0.004 261)', foreground: 'oklch(0.236 0.025 261)', card: 'oklch(1 0 0)',
  primary: 'oklch(0.488 0.243 264.376)', primaryFg: 'oklch(1 0 0)', secondary: 'oklch(0.962 0.007 261)',
  muted: 'oklch(0.962 0.007 261)', mutedFg: 'oklch(0.491 0.032 261)', accent: 'oklch(0.971 0.013 264)',
  accentFg: 'oklch(0.488 0.243 264.376)', border: 'oklch(0.916 0.009 261)', success: 'oklch(0.508 0.118 165.612)',
  warning: 'oklch(0.555 0.163 48.998)', destructive: 'oklch(0.577 0.245 27.325)',
  chart1: 'oklch(0.488 0.243 264.376)', chart2: 'oklch(0.697 0.158 264)', chart4: 'oklch(0.916 0.009 261)',
  streak: 'oklch(0.68 0.19 48)', sidebar: 'oklch(0.962 0.007 261)',
  ring50: 'oklch(0.488 0.243 264.376 / 50%)', cardRing: 'oklch(0.236 0.025 261 / 10%)', primaryHover: 'oklch(0.488 0.243 264.376 / 80%)',
}
const D = {
  background: 'oklch(0.175 0.025 261)', foreground: 'oklch(0.962 0.007 261)', card: 'oklch(0.236 0.025 261)',
  primary: 'oklch(0.697 0.158 264)', primaryFg: 'oklch(0.175 0.025 261)', secondary: 'oklch(0.291 0.025 261)',
  muted: 'oklch(0.291 0.025 261)', mutedFg: 'oklch(0.68 0.025 261)', accent: 'oklch(0.291 0.025 261)',
  accentFg: 'oklch(0.697 0.158 264)', border: 'oklch(1 0 0 / 10%)', success: 'oklch(0.765 0.177 163.223)',
  warning: 'oklch(0.828 0.189 84.429)', destructive: 'oklch(0.704 0.191 22.216)',
  chart1: 'oklch(0.697 0.158 264)', chart2: 'oklch(0.488 0.243 264.376)', chart4: 'oklch(0.637 0.025 261)',
  streak: 'oklch(0.84 0.1 75)', sidebar: 'oklch(0.236 0.025 261)',
  ring50: 'oklch(0.697 0.158 264 / 50%)', cardRing: 'oklch(0.962 0.007 261 / 10%)', primaryHover: 'oklch(0.697 0.158 264 / 80%)',
}
const pairs = [
  ['Body text on page', 'foreground', 'background', 'text'],
  ['Body text on card', 'foreground', 'card', 'text'],
  ['Body text on Today panel (bg-accent)', 'foreground', 'accent', 'text'],
  ['Muted text on page', 'mutedFg', 'background', 'text'],
  ['Muted text on card', 'mutedFg', 'card', 'text'],
  ['Muted text on Today panel (bg-accent)', 'mutedFg', 'accent', 'text'],
  ['Muted text on trend tile / chip (bg-secondary, bg-muted)', 'mutedFg', 'secondary', 'text'],
  ['Muted text on sidebar', 'mutedFg', 'sidebar', 'text'],
  ['TODAY eyebrow (text-accent-foreground on bg-accent)', 'accentFg', 'accent', 'text'],
  ['Trend detail (text-primary on bg-secondary)', 'primary', 'secondary', 'text'],
  ['CTA label on primary', 'primaryFg', 'primary', 'text'],
  ['CTA label on hover (primary/80 over Today panel)', 'primaryFg', 'primaryHover@accent', 'text'],
  ['CTA fill vs Today panel', 'primary', 'accent', 'nontext'],
  ['Today panel vs page', 'accent', 'background', 'surface'],
  ['Card vs page', 'card', 'background', 'surface'],
  ['Sidebar vs page', 'sidebar', 'background', 'surface'],
  ['Chip (bg-muted) vs card', 'muted', 'card', 'surface'],
  ['Border vs card (outline button, filter chip edge)', 'border', 'card', 'nontext'],
  ['Border vs page', 'border', 'background', 'nontext'],
  ['Card ring (foreground/10) vs page', 'cardRing@card', 'background', 'nontext'],
  ['Focus ring (ring/50 over page) vs page', 'ring50', 'background', 'nontext'],
  ['Focus ring (ring/50 over card) vs card', 'ring50', 'card', 'nontext'],
  ['Goal ring stroke-primary vs track stroke-muted', 'primary', 'muted', 'nontext'],
  ['Goal ring track (stroke-muted) vs card', 'muted', 'card', 'nontext'],
  ['Bar: mastered (chart-1) vs learning (chart-2)', 'chart1', 'chart2', 'nontext'],
  ['Bar: learning (chart-2) vs not started (chart-4)', 'chart2', 'chart4', 'nontext'],
  ['Bar: not started (chart-4) vs card', 'chart4', 'card', 'nontext'],
  ['Bar: mastered (chart-1) vs card', 'chart1', 'card', 'nontext'],
  ['Bar: learning (chart-2) vs card', 'chart2', 'card', 'nontext'],
  ['Streak flame icon vs card', 'streak', 'card', 'nontext'],
  ['Success text on card', 'success', 'card', 'text'],
  ['Warning text on card', 'warning', 'card', 'text'],
  ['Destructive text on card', 'destructive', 'card', 'text'],
]
function get(T, key) {
  if (key.includes('@')) { const [k, b] = key.split('@'); return resolve(T[k], T[b]).hex }
  return T[key]
}
for (const [name, T] of [['LIGHT', L], ['DARK', D]]) {
  console.log(`\n### Current palette, ${name}\n`)
  console.log('| Pairing | Foreground | Background | WCAG | APCA Lc |')
  console.log('|---|---|---|---:|---:|')
  for (const [label, a, b] of pairs) {
    const bg = get(T, b); const fg = get(T, a)
    const p = pair(fg, bg)
    console.log(`| ${label} | ${p.fg.hex} | ${p.bg.hex} | ${f2(p.ratio)} | ${f1(p.lc)} |`)
  }
  console.log('\nGamut (sRGB):')
  for (const [k, v] of Object.entries(T)) { if (v.includes('/')) continue; const r = resolve(v); console.log(`  ${k.padEnd(12)} ${v.padEnd(34)} ${r.hex} ${r.srgbOk ? 'in sRGB' : 'OUT of sRGB -> mapped ' + r.mappedOklch + ' (naive clip ' + r.naiveClipHex + ')'}`) }
}

// The hex values named in the globals.css comments, converted to OKLCH, next to the value actually declared.
import { converter, parse } from 'culori'
const ok = converter('oklch')
console.log('\n### Comment vs declared value\n')
console.log('| Token | Hex in comment | That hex in OKLCH | Declared OKLCH | Declared value as hex |')
console.log('|---|---|---|---|---|')
for (const [t, hex, decl] of [['--background', '#F8FAFC', L.background], ['--foreground', '#1E293B', L.foreground], ['--primary', '#2563EB', L.primary], ['--secondary', '#F1F5F9', L.secondary], ['--muted-foreground', '#64748B', L.mutedFg], ['--accent', '#EFF6FF', L.accent], ['--border', '#E2E8F0', L.border], ['--success', '#047857', L.success], ['--warning', '#B45309', L.warning], ['.dark --primary', '#60A5FA', D.primary], ['.dark --success', '#34D399', D.success], ['.dark --warning', '#FBBF24', D.warning]]) {
  const o = ok(parse(hex)); console.log(`| ${t} | ${hex} | oklch(${o.l.toFixed(3)} ${o.c.toFixed(3)} ${(o.h ?? 0).toFixed(1)}) | ${decl} | ${resolve(decl).hex} |`)
}
