import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { BookOpen, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Text } from "@workspace/ui/components/text"
import { useViewer } from "@/components/session-provider"

export function AppSidebar(): JSX.Element {
  const viewer = useViewer()

  return (
    <aside
      aria-label="Application sidebar"
      className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:sticky md:top-0 md:h-dvh md:w-64 md:border-r md:border-b-0"
    >
      <div className="px-4 py-3 md:py-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span>Memli</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 border-t border-sidebar-border px-4 py-4 md:mt-auto">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarFallback />
          </Avatar>
          <div className="min-w-0">
            <Text className="truncate text-sm leading-5 font-medium text-foreground">
              {viewer.displayName}
            </Text>
            <Text variant="small" className="truncate">
              {viewer.email}
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start px-2"
          render={<Link to="/" />}
          nativeButton={false}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
