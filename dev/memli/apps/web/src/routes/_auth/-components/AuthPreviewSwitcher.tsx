import type { JSX, ReactNode } from "react"
import type { AuthPreview } from "./auth-previews"

/** What a switcher link needs, besides where it goes. */
export type PreviewLinkProps = {
  title: string
  "aria-current": "page" | undefined
  className: string
  children: ReactNode
}

/**
 * Links between an auth page's `?preview=` states. Development only. The page
 * draws each link, so its route types check the preview name.
 */
export function AuthPreviewSwitcher<Name extends string>({
  previews,
  current,
  renderLink,
}: {
  previews: Readonly<Record<Name, AuthPreview>>
  current: Name
  renderLink: (name: Name, props: PreviewLinkProps) => JSX.Element
}): JSX.Element {
  const names = Object.keys(previews) as Name[]
  return (
    <nav
      aria-label="Sign-in previews"
      // Design-floor checks (e2e/floors.spec.ts) skip DEV-only tools.
      data-dev-only=""
      className="mb-4 flex w-full max-w-md flex-col gap-1.5 rounded-lg border border-dashed border-muted-foreground/40 p-2 text-xs"
    >
      <div className="flex flex-wrap items-center gap-1">
        {names.map((name) => (
          <span key={name}>
            {renderLink(name, {
              title: previews[name].description,
              "aria-current": name === current ? "page" : undefined,
              className:
                "touch-target inline-flex min-h-6 items-center rounded-md px-2 py-1 hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground",
              children: name,
            })}
          </span>
        ))}
      </div>
      <p className="text-muted-foreground">{previews[current].description}</p>
    </nav>
  )
}
