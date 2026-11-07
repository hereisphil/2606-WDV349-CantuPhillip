import type { JSX } from "react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ChevronsUpDown,
  CreditCard,
  Image as ImageIcon,
  Layers,
  LogOut,
  SlidersHorizontal,
  UserIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { BrandMark } from "@/components/brand-mark"
import { MenuGlyph } from "@/components/menu-glyph"
import { PlanBadge } from "@/components/plan-badge"
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
import { useViewer } from "@/components/session-provider"

const railActiveClass =
  "[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"

const railLinks = [
  { to: "/dashboard" as const, label: "Decks", icon: Layers, exact: true },
  {
    to: "/community" as const,
    label: "Community Gallery",
    icon: ImageIcon,
    exact: false,
  },
]

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
        "flex min-h-6 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        railActiveClass,
        "[&.active]:hover:bg-sidebar-accent [&.active]:hover:text-sidebar-accent-foreground"
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

function AccountMenuItems(): JSX.Element {
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link to="/dashboard" />}>
          <UserIcon aria-hidden="true" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/settings" />}>
          <SlidersHorizontal aria-hidden="true" />
          Learning Settings
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/pricing" />}>
          <CreditCard aria-hidden="true" />
          Subscription / Plan
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link to="/" />}>
          <LogOut aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}

export function AppSidebar(): JSX.Element {
  const viewer = useViewer()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <aside
      aria-label="Application sidebar"
      className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:sticky md:top-0 md:h-dvh md:w-64 md:border-r md:border-b-0"
    >
      <div className="flex items-center justify-between px-4 py-3 md:pt-6 md:pb-4">
        <Link to="/dashboard" className="flex">
          <BrandMark />
        </Link>

        <div className="flex items-center gap-1 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Account menu, @${viewer.username}`}
              render={
                <Button
                  variant="ghost"
                  className="size-11 rounded-full p-0 hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
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
                  <PlanBadge plan={viewer.plan} />
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <AccountMenuItems />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={navOpen} onOpenChange={setNavOpen}>
            <DropdownMenuTrigger
              aria-label="Navigation menu"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
                />
              }
            >
              <MenuGlyph open={navOpen} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                {railLinks.map(({ to, label, icon: Icon, exact }) => (
                  <DropdownMenuItem
                    key={label}
                    className={railActiveClass}
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

      <RailNav />

      <div className="mt-auto hidden border-t border-sidebar-border p-3 md:block">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Account menu, @${viewer.username}`}
            render={
              <Button
                variant="ghost"
                className="h-auto w-full justify-between gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-sidebar-border hover:text-sidebar-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-foreground"
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
                <PlanBadge plan={viewer.plan} />
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
