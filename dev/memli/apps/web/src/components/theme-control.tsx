import type { JSX } from "react"
import { ChevronsUpDown, Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useTheme, type Theme } from "@/components/theme-provider"

const messages = {
  legend: "Theme",
  system: "Match my device",
  light: "Light",
  dark: "Dark",
} as const

// One list for both placements, so the labels and their order cannot drift (WCAG 3.2.4).
const options: readonly { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: messages.system, icon: Monitor },
  { value: "light", label: messages.light, icon: Sun },
  { value: "dark", label: messages.dark, icon: Moon },
]

function asTheme(value: unknown): Theme | undefined {
  return options.find((option) => option.value === value)?.value
}

type ThemeMenuProps = {
  /**
   * "topBar": a short "Theme" button for the phone header.
   * "sidebar": a full-width row at the foot of the desktop sidebar that also
   * shows the current choice, so nobody has to open it to know the setting.
   */
  placement: "topBar" | "sidebar"
}

/**
 * The theme switch. Always labeled with the word "Theme", never an icon alone,
 * so learners who do not know the sun and moon convention can still find it.
 */
export function ThemeMenu({ placement }: ThemeMenuProps): JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const TriggerIcon = resolvedTheme === "dark" ? Moon : Sun
  const current = options.find((option) => option.value === theme)
  const inSidebar = placement === "sidebar"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          inSidebar ? (
            <Button
              variant="ghost"
              className="h-auto min-h-11 w-full justify-start gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
            />
          ) : (
            <Button
              variant="ghost"
              // A long translated label wraps to two lines instead of pushing the account and menu buttons off a narrow screen.
              className="h-auto min-h-11 max-w-28 gap-1.5 px-2 py-1 text-start text-sm leading-tight font-semibold whitespace-normal hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
            />
          )
        }
      >
        <TriggerIcon aria-hidden="true" />
        {inSidebar && current ? (
          <>
            {/* Two lines, like the account row, so a long choice or translation is not cut off. */}
            <span className="flex min-w-0 flex-1 flex-col items-start">
              <span className="text-xs leading-4 font-medium">
                {messages.legend}
              </span>{" "}
              <span className="max-w-full truncate text-sm leading-5 font-medium text-foreground">
                {current.label}
              </span>
            </span>
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </>
        ) : (
          messages.legend
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={inSidebar ? "top" : "bottom"}
        align={inSidebar ? "start" : "end"}
        className="w-60"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{messages.legend}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => {
              const next = asTheme(value)
              if (next) {
                setTheme(next)
              }
            }}
          >
            {options.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem
                key={value}
                value={value}
                className="min-h-11 text-base data-checked:font-semibold"
              >
                <Icon aria-hidden="true" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
