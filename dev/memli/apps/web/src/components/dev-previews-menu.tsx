import type { JSX } from "react"
import { Link, useLocation, useRouterState } from "@tanstack/react-router"
import { FlaskConical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { prototypeDashboardMetrics } from "@/routes/_app/-components/dashboard-metrics"

// Development-only shortcut to the `?preview=` snapshots. `__root.tsx` lazy-loads it
// behind `import.meta.env.DEV`, so it never reaches production or the axe audit.

const studyCourseId = prototypeDashboardMetrics.decks[0].courseId

export default function DevPreviewsMenu(): JSX.Element {
  const inPreview = useLocation({
    select: (location) => "preview" in location.search,
  })
  const hasAppSidebar = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === "/_app"),
  })

  // Bottom-left: clear of the app bar and session header, opposite the Router Devtools (bottom-right).
  // From md up, the app sidebar (md:w-64) has its account menu down there, so step past it.
  return (
    <div
      className={cn(
        "fixed bottom-3 left-3 z-50",
        hasAppSidebar && "md:left-[calc(16rem+0.75rem)]"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="sm"
              className="bg-red-600 text-white shadow-md hover:bg-red-700 focus-visible:ring-red-600/50"
            />
          }
        >
          <FlaskConical aria-hidden="true" />
          Previews
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Dev previews</DropdownMenuLabel>
            <DropdownMenuItem
              render={<Link to="/dashboard" search={{ preview: "default" }} />}
            >
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <Link
                  to="/study/$courseId"
                  params={{ courseId: studyCourseId }}
                  search={{ mode: "review", preview: "default" }}
                />
              }
            >
              Study session
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {inPreview ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={
                    <Link
                      to="."
                      search={(prev) => ({ ...prev, preview: undefined })}
                    />
                  }
                >
                  Exit preview
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
