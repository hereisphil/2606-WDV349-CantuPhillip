import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import {
  BookOpen,
  ChevronsUpDown,
  CreditCard,
  Flame,
  Image as ImageIcon,
  Layers,
  LogOut,
  SlidersHorizontal,
  UserIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useViewer, type ViewerPlan } from "@/components/session-provider"

const railLinks = [
  { to: "/dashboard" as const, label: "Decks", icon: Layers, exact: true },
  {
    to: "/community" as const,
    label: "Community Gallery",
    icon: ImageIcon,
    exact: false,
  },
]

function StreakDisplay({ days }: { days: number }): JSX.Element {
  const dayLabel = days === 1 ? "1 Day" : `${days} Days`

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-streak px-3 py-2.5">
      <Flame className="size-5 text-streak-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <Text className="text-[10px] leading-4 font-medium tracking-wider text-streak-foreground uppercase">
          Streak
        </Text>
        <Text className="text-sm leading-5 font-semibold text-foreground">
          {dayLabel}
        </Text>
      </div>
    </div>
  )
}

function RailLink({
  to,
  label,
  icon: Icon,
  exact = false,
}: {
  to: "/dashboard" | "/community"
  label: string
  icon: typeof Layers
  exact?: boolean
}): JSX.Element {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        "[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground [&.active]:hover:bg-sidebar-accent [&.active]:hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  )
}

function RailNav(): JSX.Element {
  return (
    <nav
      aria-label="Primary"
      className="hidden flex-col gap-1 px-3 py-2 md:flex"
    >
      {railLinks.map(({ to, label, icon, exact }) => (
        <RailLink key={label} to={to} label={label} icon={icon} exact={exact} />
      ))}
    </nav>
  )
}

function ProBadge({ plan }: { plan: ViewerPlan }): JSX.Element | null {
  if (plan !== "pro") return null

  return (
    <Badge
      variant="outline"
      className="h-4 border-amber-500/30 bg-amber-500/10 px-1.5 text-[10px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300"
    >
      Pro
    </Badge>
  )
}

function AccountMenuItems(): JSX.Element {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem
          className="cursor-pointer"
          render={<Link to="/dashboard" />}
        >
          <UserIcon aria-hidden="true" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          render={<Link to="/settings" />}
        >
          <SlidersHorizontal aria-hidden="true" />
          Learning Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          render={<Link to="/pricing" />}
        >
          <CreditCard aria-hidden="true" />
          Subscription / Plan
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer" render={<Link to="/" />}>
          <LogOut aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}

export function AppSidebar(): JSX.Element {
  const viewer = useViewer()

  return (
    <aside
      aria-label="Application sidebar"
      className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:sticky md:top-0 md:h-dvh md:w-64 md:border-r md:border-b-0"
    >
      <div className="flex items-center justify-between px-4 py-3 md:pt-6 md:pb-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span>Memli</span>
        </Link>

        {/* Mobile controls: avatar dropdown + hamburger dropdown */}
        <div className="flex items-center gap-1 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Account menu, @${viewer.username}`}
              render={
                <Button
                  variant="ghost"
                  className="size-11 cursor-pointer rounded-full p-0 hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
                />
              }
            >
              <Avatar>
                <AvatarFallback />
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center justify-between gap-2 py-1.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    @{viewer.username}
                  </span>
                  <ProBadge plan={viewer.plan} />
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <AccountMenuItems />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Navigation menu"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="group/menu cursor-pointer hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
                />
              }
            >
              <div className="relative flex h-5 w-5 flex-col items-center justify-center">
                <span className="absolute h-0.5 w-5 -translate-y-1.5 bg-foreground transition-all duration-300 group-data-popup-open/menu:translate-y-0 group-data-popup-open/menu:rotate-45" />
                <span className="h-0.5 w-5 bg-foreground transition-all duration-300 group-data-popup-open/menu:opacity-0" />
                <span className="absolute h-0.5 w-5 translate-y-1.5 bg-foreground transition-all duration-300 group-data-popup-open/menu:translate-y-0 group-data-popup-open/menu:-rotate-45" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                {railLinks.map(({ to, label, icon: Icon, exact }) => (
                  <DropdownMenuItem
                    key={label}
                    className="cursor-pointer [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
                    render={<Link to={to} activeOptions={{ exact }} />}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-3 pb-3 md:px-4 md:pb-0">
        <StreakDisplay days={viewer.streakDays} />
      </div>

      <RailNav />

      {/* Desktop bottom capsule: full-area hover + pointer cursor */}
      <div className="mt-auto hidden border-t border-sidebar-border p-3 md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Account menu, @${viewer.username}`}
            render={
              <Button
                variant="ghost"
                className="h-auto w-full cursor-pointer justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-sidebar-border hover:text-sidebar-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-foreground"
              />
            }
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar>
                <AvatarFallback />
              </Avatar>
              <span className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="max-w-full truncate text-sm leading-5 font-medium text-foreground">
                  @{viewer.username}
                </span>
                <ProBadge plan={viewer.plan} />
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-56">
            <AccountMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
