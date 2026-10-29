/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type JSX, type ReactNode } from "react"

// Viewer/useViewer are temporary until Better Auth and a real user is created
export type Viewer = {
  id: string
  displayName: string
  email: string
  uiLocale: string
  streakDays: number
}

// Prototype stand-in. Better Auth (#108) replaces this value inside the provider.
const prototypeViewer = {
  id: "usr_prototype_01",
  displayName: "Prototype Learner",
  email: "learner@prototype.memli.test",
  uiLocale: "en",
  streakDays: 12,
} as const satisfies Viewer

const SessionContext = createContext<Viewer | null>(null)

export function SessionProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return (
    <SessionContext.Provider value={prototypeViewer}>
      {children}
    </SessionContext.Provider>
  )
}

export function useViewer(): Viewer {
  const viewer = useContext(SessionContext)

  if (viewer === null) {
    throw new Error("useViewer must be used within a SessionProvider")
  }

  return viewer
}
