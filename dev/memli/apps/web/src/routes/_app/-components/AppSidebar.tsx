import type { JSX } from "react"
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  ChevronsUpDown,
  CreditCard,
  Image as ImageIcon,
  LayoutDashboard,
  Library,
  LogOut,
  SlidersHorizontal,
  UserIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { BrandMark } from "@/components/brand-mark"
import { MenuGlyph } from "@/components/menu-glyph"
import { PlanBadge } from "@/components/plan-badge"
import { ThemeMenu } from "@/components/theme-control"
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
import { useFormatters } from "@/lib/formatters"
import { signOut } from "@/lib/auth"
import { endSession } from "@/lib/session"

const messages = {
  sidebar: "Application sidebar",
  primaryNav: "Primary",
  navigationMenu: "Navigation menu",
  accountMenu: "Account menu, {name}",
  accountMenuPrefix: "Account menu, ",
  dashboard: "Dashboard",
  courses: "Courses",
  community: "Community",
  profile: "View Profile",
  settings: "Learning Settings",
  plan: "Subscription / Plan",
  signOut: "Sign out",
} as const

const railActiveClass =
  "[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"

const railLinks = [
  {
    to: "/dashboard" as const,
    label: messages.dashboard,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    // Not exact: a course's overview page keeps Courses lit.
    to: "/courses" as const,
    label: messages.courses,
    icon: Library,
    exact: false,
  },
  {
    to: "/community" as const,
    label: messages.community,
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
  to: "/dashboard" | "/courses" | "/community"
  label: string
  icon: typeof LayoutDashboard
  exact?: boolean
}): JSX.Element {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-foreground-strong",
        railActiveClass,
        "[&.active]:hover:bg-sidebar-accent [&.active]:hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </Link>
  )
}

function RailNav(): JSX.Element {
  return (
    <nav
      aria-label={messages.primaryNav}
      className="hidden flex-col gap-1 px-3 py-2 md:flex"
    >
      {railLinks.map(({ to, label, icon, exact }) => (
        <RailLink key={label} to={to} label={label} icon={icon} exact={exact} />
      ))}
    </nav>
  )
}

function AccountMenuItems(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Forget the learner only once the server has ended the session, so a
  // failed request never shows "signed out" over a cookie that still works.
  const handleSignOut = async (): Promise<void> => {
    const result = await signOut()
    if (!result.ok) return
    // Leave the app first: its pages need a learner while they are mounted.
    await navigate({ to: "/" })
    endSession(queryClient)
  }

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link to="/dashboard" />}>
          <UserIcon aria-hidden="true" />
          {messages.profile}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/settings" />}>
          <SlidersHorizontal aria-hidden="true" />
          {messages.settings}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/pricing" />}>
          <CreditCard aria-hidden="true" />
          {messages.plan}
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            void handleSignOut()
          }}
        >
          <LogOut aria-hidden="true" />
          {messages.signOut}
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  )
}

export function AppSidebar(): JSX.Element {
  const viewer = useViewer()
  const { format } = useFormatters()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <aside
      aria-label={messages.sidebar}
      className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:sticky md:top-0 md:h-dvh md:w-56 md:border-e md:border-b-0 lg:w-64"
    >
      <div className="flex items-center justify-between px-4 py-1.5 md:pt-6 md:pb-4">
        <Link to="/dashboard" className="flex min-h-11 items-center">
          <BrandMark />
        </Link>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeMenu placement="topBar" />
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={format(messages.accountMenu, {
                name: viewer.displayName,
              })}
              render={
                <Button
                  variant="ghost"
                  size="icon-touch"
                  className="rounded-full hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
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
                    {viewer.displayName}
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
              aria-label={messages.navigationMenu}
              render={
                <Button
                  variant="ghost"
                  size="icon-touch"
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

      <div className="mt-auto hidden flex-col gap-2 p-3 md:flex">
        <ThemeMenu placement="sidebar" />
        <div className="border-t border-sidebar-border pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="touch"
                  className="w-full justify-between gap-3 rounded-xl px-2.5 py-2 text-start hover:bg-sidebar-border hover:text-sidebar-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-foreground"
                />
              }
            >
              {/* Named by its content so the accessible name includes the visible text. */}
              <span className="sr-only">{messages.accountMenuPrefix}</span>
              <span className="flex min-w-0 items-center gap-2.5">
                <Avatar>
                  <AvatarFallback />
                </Avatar>
                <span className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="max-w-full truncate text-sm leading-5 font-medium text-foreground">
                    {viewer.displayName}
                  </span>{" "}
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
      </div>
    </aside>
  )
}
