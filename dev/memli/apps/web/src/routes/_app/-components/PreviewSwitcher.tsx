import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import { previewNames, type PreviewName } from "./dashboard-previews"

/** Development-only links between seeded dashboard states. Not translated on purpose. */
export function PreviewSwitcher({
  current,
}: {
  current: PreviewName
}): JSX.Element {
  return (
    <nav
      aria-label="Dashboard previews"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-2 text-xs"
    >
      <span className="font-medium text-muted-foreground">Preview</span>
      {previewNames.map((name) => (
        <Link
          key={name}
          to="/dashboard"
          search={{ preview: name }}
          aria-current={name === current ? "page" : undefined}
          className="rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        >
          {name}
        </Link>
      ))}
    </nav>
  )
}
