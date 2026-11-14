import type { JSX } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
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

// One list for both presentations, so the labels and their order cannot drift (WCAG 3.2.4).
const options: readonly { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: messages.system, icon: Monitor },
  { value: "light", label: messages.light, icon: Sun },
  { value: "dark", label: messages.dark, icon: Moon },
]

function asTheme(value: unknown): Theme | undefined {
  return options.find((option) => option.value === value)?.value
}

/**
 * Always-visible radio group for the desktop sidebar. Native radios give arrow
 * keys, "2 of 3, selected" and forced-colors support without extra code.
 */
export function ThemeRadioGroup(): JSX.Element {
  const { theme, setTheme } = useTheme()

  // The border sits on a wrapper: a legend inside a bordered fieldset is drawn on the border line.
  return (
    <div className="rounded-xl border border-sidebar-border bg-card p-2">
      <fieldset className="flex flex-col gap-1">
        <legend className="px-2 pt-1 pb-1.5 text-sm font-semibold text-foreground">
          {messages.legend}
        </legend>
        {options.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-base text-foreground hover:bg-muted has-checked:bg-accent has-checked:font-semibold has-checked:text-accent-foreground"
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={theme === value}
              onChange={() => {
                setTheme(value)
              }}
              className="size-4 shrink-0 cursor-pointer accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {label}
          </label>
        ))}
      </fieldset>
    </div>
  )
}

/** A labeled "Theme" button for the phone top bar that opens the same three choices. */
export function ThemeMenu(): JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const TriggerIcon = resolvedTheme === "dark" ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="min-h-11 gap-1.5 px-2.5 text-sm font-semibold hover:bg-sidebar-accent data-popup-open:bg-sidebar-accent"
          />
        }
      >
        <TriggerIcon aria-hidden="true" />
        {messages.legend}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
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
                className="min-h-11 text-base"
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
