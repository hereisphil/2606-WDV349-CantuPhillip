// Tier 1 primitives and tier 2 semantic roles for the proposed Memli color system.
// Every value here is what verify.mjs checks. Edit here, rerun verify.mjs.
import { parse, displayable, converter } from 'culori'
const toRgb = converter('rgb')

// [L, C, H] per step. Chroma is the *requested* chroma; build() lowers it only if
// the color would fall outside sRGB, so every primitive is guaranteed displayable.
const RAMPS = {
  neutral: { // gray tinted toward the brand hue (264). Light UI surfaces, all text, borders.
    0: [1, 0, 0], 50: [0.985, 0.004, 264], 100: [0.965, 0.008, 264], 200: [0.94, 0.012, 264],
    300: [0.87, 0.022, 264], 400: [0.80, 0.024, 264], 500: [0.70, 0.030, 264], 600: [0.62, 0.034, 264],
    700: [0.47, 0.040, 265], 800: [0.33, 0.045, 266], 900: [0.26, 0.045, 266], 950: [0.20, 0.042, 266],
  },
  navy: { // dark-theme surfaces only. More chroma than neutral so it reads navy, not slate.
    950: [0.16, 0.038, 266], 900: [0.195, 0.045, 266], 850: [0.25, 0.050, 266], 800: [0.295, 0.053, 266],
    750: [0.34, 0.055, 266], 700: [0.40, 0.058, 266],
  },
  blue: { // brand. 700 is the existing --primary, unchanged.
    50: [0.972, 0.013, 262], 100: [0.94, 0.028, 262], 200: [0.89, 0.053, 262], 300: [0.82, 0.089, 262],
    400: [0.73, 0.139, 262], 500: [0.61, 0.19, 263], 600: [0.54, 0.225, 264], 700: [0.488, 0.243, 264.376],
    800: [0.42, 0.20, 265], 900: [0.35, 0.12, 266], 950: [0.29, 0.105, 267],
  },
  amber: { // warm accent. Hue drifts from yellow (light steps) to orange-brown (dark steps).
    50: [0.985, 0.024, 95], 100: [0.96, 0.06, 95], 200: [0.925, 0.11, 94], 300: [0.89, 0.15, 92],
    400: [0.855, 0.17, 88], 500: [0.80, 0.165, 80], 600: [0.70, 0.153, 68], 700: [0.58, 0.136, 60],
    800: [0.48, 0.115, 56], 900: [0.39, 0.09, 54], 950: [0.29, 0.065, 52],
  },
  orange: { // streak flame and caution.
    50: [0.98, 0.014, 70], 100: [0.955, 0.031, 68], 200: [0.91, 0.062, 65], 300: [0.85, 0.103, 62],
    400: [0.78, 0.15, 56], 500: [0.70, 0.18, 50], 600: [0.62, 0.174, 46], 700: [0.53, 0.14, 50],
    800: [0.45, 0.115, 50], 900: [0.38, 0.09, 48], 950: [0.28, 0.065, 46],
  },
  green: { // success, "correct", goal met.
    50: [0.98, 0.02, 160], 100: [0.955, 0.045, 160], 200: [0.915, 0.08, 160], 300: [0.86, 0.12, 160],
    400: [0.79, 0.15, 160], 500: [0.70, 0.15, 160], 600: [0.585, 0.13, 161], 700: [0.51, 0.111, 162],
    800: [0.43, 0.092, 163], 900: [0.36, 0.075, 164], 950: [0.27, 0.055, 165],
  },
  red: { // danger, destructive, "wrong".
    50: [0.975, 0.012, 20], 100: [0.945, 0.027, 20], 200: [0.895, 0.054, 20], 300: [0.82, 0.1, 21],
    400: [0.73, 0.16, 22], 500: [0.65, 0.20, 25], 600: [0.58, 0.215, 27], 700: [0.51, 0.195, 28],
    800: [0.44, 0.16, 28], 900: [0.37, 0.125, 28], 950: [0.27, 0.085, 27],
  },
}

const fmt = (l, c, h) => c === 0 ? `oklch(${+l.toFixed(3)} 0 0)` : `oklch(${+l.toFixed(3)} ${+c.toFixed(3)} ${+h.toFixed(3)})`
function fit(l, c, h) { // lower chroma in 0.001 steps until the color is inside sRGB
  let cc = c
  while (cc > 0 && !displayable(parse(fmt(l, cc, h)))) cc = Math.round((cc - 0.001) * 1000) / 1000
  return { css: fmt(l, cc, h), requestedC: c, finalC: cc, reduced: cc !== c }
}
export const prim = {}
export const primMeta = {}
for (const [ramp, steps] of Object.entries(RAMPS)) for (const [step, [l, c, h]] of Object.entries(steps)) {
  const r = fit(l, c, h); prim[`${ramp}.${step}`] = r.css; primMeta[`${ramp}.${step}`] = r
}
export const rampNames = Object.keys(RAMPS)
export const rampSteps = Object.fromEntries(Object.entries(RAMPS).map(([k, v]) => [k, Object.keys(v).map(Number).sort((a, b) => a - b)]))

// Tier 2: semantic roles -> primitive step. The key is the CSS custom property name.
export const light = {
  // surfaces
  'background': 'neutral.100', 'sidebar': 'neutral.50', 'card': 'neutral.0', 'popover': 'neutral.0',
  'muted': 'neutral.200', 'secondary': 'neutral.200', 'accent': 'blue.100',
  'hero': 'blue.950', 'hero-soft': 'blue.100',
  // text
  'foreground-strong': 'neutral.950', 'foreground': 'neutral.800', 'muted-foreground': 'neutral.700',
  'accent-foreground': 'blue.800', 'hero-foreground': 'neutral.50', 'hero-muted-foreground': 'blue.200',
  'brand': 'blue.700', 'link': 'blue.700',
  // borders and focus
  'border': 'neutral.300', 'border-strong': 'neutral.600', 'input': 'neutral.600', 'ring': 'blue.700',
  'hero-border': 'blue.800', 'hero-ring': 'neutral.50', 'hero-chip': 'mix:hero-foreground:hero:14',
  // brand-colored solid (existing shadcn --primary; stays blue and text-safe)
  'primary': 'blue.700', 'primary-foreground': 'neutral.0', 'primary-hover': 'blue.800',
  // the ONE call to action per screen, option B (warm, recommended)
  'cta': 'amber.400', 'cta-foreground': 'neutral.950', 'cta-hover': 'amber.300',
  'cta-active': 'amber.500', 'cta-edge': 'amber.700',
  // the ONE call to action per screen, option A (blue)
  'ctaA': 'blue.700', 'ctaA-foreground': 'neutral.0', 'ctaA-hover': 'blue.800',
  'ctaA-active': 'blue.900', 'ctaA-edge': 'blue.900',
  // status
  'success': 'green.700', 'success-container': 'green.100', 'success-container-foreground': 'green.900',
  'warning': 'orange.700', 'warning-container': 'orange.100', 'warning-container-foreground': 'orange.900',
  'destructive': 'red.700', 'destructive-foreground': 'neutral.0', 'destructive-container': 'red.100', 'destructive-container-foreground': 'red.900',
  'streak': 'orange.600',
  // data viz, option B palette (blue family)
  'viz-mastered': 'blue.950', 'viz-learning': 'blue.500', 'viz-new': 'neutral.200', 'viz-track': 'neutral.200',
  'viz-progress': 'blue.700', 'viz-on-progress': 'neutral.0',
  // data viz, option A palette (green family, keeps blue for the action only)
  'vizA-mastered': 'green.950', 'vizA-learning': 'green.600', 'vizA-progress': 'green.700',
}
export const dark = {
  'background': 'navy.900', 'sidebar': 'navy.950', 'card': 'navy.850', 'popover': 'navy.800',
  'muted': 'navy.750', 'secondary': 'navy.750', 'accent': 'navy.750',
  'hero': 'blue.900', 'hero-soft': 'navy.800',
  'foreground-strong': 'neutral.50', 'foreground': 'neutral.200', 'muted-foreground': 'neutral.300',
  'accent-foreground': 'blue.200', 'hero-foreground': 'neutral.50', 'hero-muted-foreground': 'blue.100',
  'brand': 'blue.300', 'link': 'blue.200',
  'border': 'navy.700', 'border-strong': 'neutral.600', 'input': 'neutral.600', 'ring': 'blue.300',
  'hero-border': 'blue.800', 'hero-ring': 'neutral.50', 'hero-chip': 'mix:hero-foreground:hero:14',
  'primary': 'blue.200', 'primary-foreground': 'navy.950', 'primary-hover': 'blue.100',
  'cta': 'amber.300', 'cta-foreground': 'navy.950', 'cta-hover': 'amber.200',
  'cta-active': 'amber.400', 'cta-edge': 'amber.600',
  'ctaA': 'blue.200', 'ctaA-foreground': 'navy.950', 'ctaA-hover': 'blue.100',
  'ctaA-active': 'blue.300', 'ctaA-edge': 'blue.500',
  'success': 'green.300', 'success-container': 'green.950', 'success-container-foreground': 'green.200',
  'warning': 'orange.300', 'warning-container': 'orange.950', 'warning-container-foreground': 'orange.200',
  'destructive': 'red.300', 'destructive-foreground': 'navy.950', 'destructive-container': 'red.950', 'destructive-container-foreground': 'red.200',
  'streak': 'orange.400',
  'viz-mastered': 'blue.100', 'viz-learning': 'blue.500', 'viz-new': 'navy.800', 'viz-track': 'navy.800',
  'viz-progress': 'blue.400', 'viz-on-progress': 'navy.950',
  'vizA-mastered': 'green.100', 'vizA-learning': 'green.600', 'vizA-progress': 'green.400',
}
import { interpolate, formatCss } from 'culori'
const toOk = converter('oklch')
export const css = (theme, role) => {
  const p = theme[role]; if (!p) throw new Error('no role ' + role)
  if (p.startsWith('mix:')) { // mix:<role A>:<role B>:<percent of A>  == color-mix(in oklab, A p%, B)
    const [, a, b, pct] = p.split(':')
    const c = toOk(interpolate([css(theme, b), css(theme, a)], 'oklab')(Number(pct) / 100))
    return `oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${(c.h ?? 0).toFixed(1)})`
  }
  if (!prim[p]) throw new Error('no primitive ' + p); return prim[p]
}
