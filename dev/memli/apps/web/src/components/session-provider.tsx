/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type JSX, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "@tanstack/react-router"
import { sessionQuery, type Viewer } from "@/lib/queries"

// Stands in on `?preview=` snapshots opened signed out. Development only.
const previewViewer: Viewer | null = import.meta.env.DEV
  ? {
      id: "usr_preview",
      displayName: "Phillip",
      email: "preview@memli.test",
      plan: "pro",
      uiLocale: "en",
    }
  : null

// `undefined` until the first answer; `null` when signed out.
const SessionContext = createContext<Viewer | null | undefined>(undefined)

/** Shares the signed-in learner with every screen (#108). */
export function SessionProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { data } = useQuery(sessionQuery)
  return (
    <SessionContext.Provider value={data}>{children}</SessionContext.Provider>
  )
}

/**
 * The signed-in learner, or `null`. For screens anyone can open, such as
 * the marketing site. `undefined` while the first answer is on its way.
 */
export function useOptionalViewer(): Viewer | null | undefined {
  return useContext(SessionContext)
}

/**
 * The signed-in learner, on pages behind a route guard (`requireViewer` in
 * src/lib/session.ts), which loads the session before the page renders.
 */
export function useViewer(): Viewer {
  const viewer = useContext(SessionContext)
  const inPreview = useLocation({
    select: (location) => "preview" in location.search,
  })
  if (viewer !== null && viewer !== undefined) return viewer
  if (previewViewer !== null && inPreview) return previewViewer
  throw new Error("useViewer is for pages behind requireViewer")
}
