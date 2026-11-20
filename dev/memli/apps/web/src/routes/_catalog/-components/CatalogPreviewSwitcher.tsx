/* eslint-disable memli/no-literal-ui-strings -- development-only tool, never shown to learners */
import type { JSX } from "react"
import { Link } from "@tanstack/react-router"
import {
  catalogPreviewNames,
  type CatalogPreviewName,
} from "./catalog-previews"

/** Links between seeded catalog states. */
export function CatalogPreviewSwitcher({
  current,
}: {
  current: CatalogPreviewName
}): JSX.Element {
  return (
    <nav
      aria-label="Catalog previews"
      // Design-floor checks (e2e/floors.spec.ts) skip DEV-only tools.
      data-dev-only=""
      className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 p-2 text-xs"
    >
      <span className="font-medium text-muted-foreground">Preview</span>
      {catalogPreviewNames.map((name) => (
        <Link
          key={name}
          to="/courses"
          search={{ preview: name }}
          aria-current={name === current ? "page" : undefined}
          className="touch-target inline-flex min-h-6 items-center rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
        >
          {name}
        </Link>
      ))}
    </nav>
  )
}
