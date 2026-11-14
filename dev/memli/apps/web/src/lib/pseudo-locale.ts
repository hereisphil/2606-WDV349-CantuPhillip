/**
 * Development-only pseudo-localization (REDESIGN.md section 12).
 *
 * `?pseudo=long` stretches every visible string by the translation budget
 * (3x up to 10 characters, 2x up to 20, 1.6x up to 50, 1.3x beyond) with
 * accented letters, `?pseudo=cjk` swaps words for CJK characters with no
 * spaces, and `?pseudo=rtl` flips the page to right-to-left. `?pseudo=off`
 * turns it off. The choice lasts for the browser tab, because the router drops
 * search params a route does not declare.
 *
 * It rewrites text nodes in the DOM, so it reaches every string, including the
 * ones rendered straight from `messages` objects. Numbers are left alone.
 */

type PseudoMode = "long" | "rtl" | "cjk"

const STORAGE_KEY = "memli:pseudo"
const MODES: readonly PseudoMode[] = ["long", "rtl", "cjk"]
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE"])

const ACCENTS: Record<string, string> = {
  a: "å",
  b: "ƀ",
  c: "ç",
  d: "ð",
  e: "é",
  f: "ƒ",
  g: "ĝ",
  h: "ĥ",
  i: "î",
  j: "ĵ",
  k: "ķ",
  l: "ļ",
  m: "ɱ",
  n: "ñ",
  o: "ö",
  p: "þ",
  q: "ǫ",
  r: "ŕ",
  s: "š",
  t: "ţ",
  u: "û",
  v: "ṽ",
  w: "ŵ",
  x: "ẋ",
  y: "ý",
  z: "ž",
  A: "Å",
  B: "Ɓ",
  C: "Ç",
  D: "Ð",
  E: "É",
  F: "Ƒ",
  G: "Ĝ",
  H: "Ĥ",
  I: "Î",
  J: "Ĵ",
  K: "Ķ",
  L: "Ļ",
  M: "Ṁ",
  N: "Ñ",
  O: "Ö",
  P: "Þ",
  Q: "Ǫ",
  R: "Ŕ",
  S: "Š",
  T: "Ţ",
  U: "Û",
  V: "Ṽ",
  W: "Ŵ",
  X: "Ẋ",
  Y: "Ý",
  Z: "Ž",
}
const CJK =
  "学习复习单词课程今天完成开始新的更多练习进度时间分钟语言选择主题设备"

function isMode(value: string | null): value is PseudoMode {
  return MODES.includes(value as PseudoMode)
}

function growth(length: number): number {
  if (length <= 10) return 3
  if (length <= 20) return 2
  if (length <= 50) return 1.6
  return 1.3
}

function stretch(text: string): string {
  const core = text.trim()
  if (core.length === 0 || !/[A-Za-z]/.test(core)) {
    return text
  }
  const accented = [...core].map((char) => ACCENTS[char] ?? char).join("")
  const extra = Math.ceil(core.length * (growth(core.length) - 1))
  // Extra "words" so the padding can wrap like real text does.
  const padding = "ŵôŕð "
    .repeat(Math.ceil(extra / 5))
    .slice(0, extra)
    .trim()
  const lead = text.slice(0, text.indexOf(core))
  const trail = text.slice(text.indexOf(core) + core.length)
  return `${lead}${accented} ${padding}${trail}`
}

function toCjk(text: string): string {
  if (!/[A-Za-z]/.test(text)) {
    return text
  }
  // Each Latin word becomes about half as many CJK characters, with no spaces.
  return text.replace(/[A-Za-z']+\s*/g, (word) => {
    const letters = word.replace(/[^A-Za-z]/g, "")
    const count = Math.max(1, Math.ceil(letters.length / 2))
    let out = ""
    for (let index = 0; index < count; index += 1) {
      out +=
        CJK[(letters.charCodeAt(index % letters.length) + index) % CJK.length]
    }
    return out
  })
}

function readMode(): PseudoMode | null {
  const fromUrl = new URLSearchParams(window.location.search).get("pseudo")
  try {
    if (fromUrl === "off") {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (isMode(fromUrl)) {
      sessionStorage.setItem(STORAGE_KEY, fromUrl)
      return fromUrl
    }
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return isMode(stored) ? stored : null
  } catch {
    return isMode(fromUrl) ? fromUrl : null
  }
}

/** Starts pseudo-localization when the URL or this tab asked for it. */
export function startPseudoLocale(): void {
  const mode = readMode()
  if (mode === null) {
    return
  }

  if (mode === "rtl") {
    document.documentElement.dir = "rtl"
    return
  }

  const transform = mode === "long" ? stretch : toCjk
  // What this script last wrote into each node, so its own writes are not transformed twice.
  const written = new WeakMap<Text, string>()

  const visit = (node: Text): void => {
    const parent = node.parentElement
    if (parent === null || SKIP_TAGS.has(parent.tagName)) {
      return
    }
    if (parent.closest("[translate=no]")) {
      return
    }
    if (written.get(node) === node.data) {
      return
    }
    const next = transform(node.data)
    written.set(node, next)
    if (next !== node.data) {
      node.data = next
    }
  }

  const walk = (root: Node): void => {
    if (root.nodeType === Node.TEXT_NODE) {
      visit(root as Text)
      return
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      visit(node as Text)
    }
  }

  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData") {
        visit(record.target as Text)
      }
      record.addedNodes.forEach(walk)
    }
  }).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  })
  walk(document.body)
}
