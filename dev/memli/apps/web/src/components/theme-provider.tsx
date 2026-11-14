/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

// index.html reads the same key before the first paint. Keep the two in step.
const THEME_STORAGE_KEY = "theme"
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: Theme[] = ["dark", "light", "system"]

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
}

type ThemeProviderState = {
  /** What the learner chose, including "system" (Match my device). */
  theme: Theme
  /** The theme on screen right now. "system" resolves to the device setting. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }

  return THEME_VALUES.includes(value as Theme)
}

function readStoredTheme(fallback: Theme): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : fallback
  } catch {
    return fallback
  }
}

function persistTheme(nextTheme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  } catch {
    // Storage can be blocked (private windows, strict settings). The choice still applies to this page.
  }
}

// The device setting is outside React, so it is read with useSyncExternalStore
// instead of a second useState kept in sync by an effect.
function subscribeToSystemTheme(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
  mediaQuery.addEventListener("change", onChange)
  return () => {
    mediaQuery.removeEventListener("change", onChange)
  }
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function disableTransitionsTemporarily(): () => void {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

/** Puts the theme class on <html> and matches the browser's toolbar color to the page. */
function applyTheme(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement
  const restoreTransitions = disableTransitionsTemporarily()

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)

  // index.html holds both page colors on the meta tag, next to the pre-paint script.
  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]'
  )
  const color = themeColor?.dataset[resolvedTheme]
  if (themeColor && color) {
    themeColor.content = color
  }

  restoreTransitions()
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    readStoredTheme(defaultTheme)
  )
  const systemTheme = React.useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme
  )
  const resolvedTheme = theme === "system" ? systemTheme : theme

  const setTheme = React.useCallback((nextTheme: Theme) => {
    persistTheme(nextTheme)
    setThemeState(nextTheme)
  }, [])

  React.useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // Another tab changed the theme.
  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== THEME_STORAGE_KEY) {
        return
      }

      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = (): ThemeProviderState => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
