import "./env"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import "@workspace/ui/globals.css"
import { SessionProvider } from "@/components/session-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { createQueryClient, sessionQuery } from "@/lib/queries"
import { routeTree } from "@/routeTree.gen"

// One cache for every API call (src/lib/queries.ts). A session that ends
// mid-visit is forgotten, and the route guards send the learner to /signin.
const queryClient = createQueryClient({
  onUnauthorized: () => {
    queryClient.setQueryData(sessionQuery.queryKey, null)
    void router.invalidate()
  },
})

const router = createRouter({
  routeTree,
  // Loaders reach the cache through the router context.
  context: { queryClient },
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  // Hovering a link runs its loader every time; TanStack Query decides
  // whether that needs the network.
  defaultPreloadStaleTime: 0,
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
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
