import "./env"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import "@workspace/ui/globals.css"
import { SessionProvider } from "@/components/session-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { routeTree } from "@/routeTree.gen"

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Development only: ?pseudo=long|rtl|cjk stretches or flips every string to test layouts.
if (import.meta.env.DEV) {
  void import("@/lib/pseudo-locale").then(({ startPseudoLocale }) => {
    startPseudoLocale()
  })
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>
)
