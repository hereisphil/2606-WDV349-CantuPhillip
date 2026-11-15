# `@workspace/eslint-config`

Shared ESLint flat configs for the Memli monorepo.

## Exports

| Import                            | Use for                                               |
| --------------------------------- | ----------------------------------------------------- |
| `@workspace/eslint-config/base`   | Non-React TypeScript packages                         |
| `@workspace/eslint-config/react`  | React apps / UI libraries (Vite)                      |
| `@workspace/eslint-config/plugin` | Local `memli/*` rules (already registered by `react`) |

## Usage

```js
// apps/web/eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config"
import reactConfig from "@workspace/eslint-config/react"

export default defineConfig([
  ...reactConfig,
  globalIgnores(["routeTree.gen.ts"]),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

Strict custom rules (unused vars + `_` prefix, no `any`, explicit return types, type-only imports, `no-console`, `eqeqeq`, etc.) live here so every package stays consistent.

`eslint-config-prettier` is applied last in `base.js` so ESLint never fights Prettier on formatting.

## Accessibility (`jsx-a11y-x/*`)

`react` applies the `recommended` config from [`eslint-plugin-jsx-a11y-x`](https://github.com/es-tooling/eslint-plugin-jsx-a11y-x), a community fork of `eslint-plugin-jsx-a11y` with the same rules. The original doesn't support ESLint 10 yet ([jsx-a11y#1075](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/1075)); switch back if it ships support, renaming the `jsx-a11y-x/` prefix to `jsx-a11y/`.

The rules only know HTML elements, so `settings["jsx-a11y-x"].components` maps our wrappers to the element they render: `Button` → `button`, `Input` → `input`, `Label` → `label`, `AvatarImage` → `img`. TanStack `Link` is deliberately not mapped: it takes `to` instead of `href`, so every rule about anchors (such as `anchor-is-valid`) would report a false positive. The axe check covers rendered links instead.

Lint can't judge contrast, focus order, or whether names are unique across a page. Those are covered by the Playwright + axe suite in `apps/web` (`bun run test:a11y`), which the `validate` job runs against `/dashboard` and every `?preview=` state in light and dark, at desktop width and at 375 px. An `eslint-disable-next-line` needs a `--` reason, as on the shared `Label` wrapper, whose `htmlFor` arrives through spread props.

## Local rules (`memli/*`)

Rules that encode Memli decisions live in `rules/` and are exposed through `plugin.js`.

| Rule                          | Default in `react`                                    | What it enforces                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `memli/no-use-state-sprawl`   | `["error", { max: 1 }]`                               | At most one `useState` per component/hook, and no `useState` initialised with a multi-key object literal. Anything with a lifecycle or coupled values must be a `useReducer` with a discriminated union.                                                                                                |
| `memli/button-link`           | `"error"`                                             | No `Button` that renders a `Link` or `<a>`: navigation is a `<Link>` styled with `buttonVariants`, so it is announced as a link. The Radix `asChild` prop is rejected.                                                                                                                                  |
| `memli/no-literal-ui-strings` | off (`apps/web` turns it on for `src/routes/_app/**`) | No hard-coded UI text in JSX or in `aria-label` / `title` / `alt` / `placeholder` (and a few other ARIA text attributes), and no labels built with template literals or `+`. Copy comes from a `messages` object or a formatter. Option: `{ allow: ["Memli"] }` for exact strings that never translate. |
| `memli/no-restricted-classes` | off (`apps/web` turns it on for `_app`, `_session` and `src/components`) | Design floors on Tailwind classes in any string: no text under 14 px (`text-xs`, `text-[13px]`), no physical direction classes (`ml-2`, `right-4`, `text-left`; auto-fixed to `ms-2`, `end-4`, `text-start`), no CSS `order-*`, no raw colors (`bg-red-600`, `text-[#fff]`). Option: `{ allow: ["text-xs"] }` for exact classes. |
| `memli/touch-button-size` | off (same folders) | `Button` and `buttonVariants()` name a size that is 44 px or taller: `touch`, `touch-lg`, `touch-xl` or `icon-touch`. The default size is 32 px. Option: `{ sizes: [...] }`. |

The `react` config turns `no-use-state-sprawl` **on everywhere**; consumers opt _out_ for exempt zones (shadcn internals in `packages/ui`, `_marketing` / `_auth` in `apps/web`). Rationale and the state-owner table: [`docs/state-management.md`](../../docs/state-management.md).

`no-literal-ui-strings`, `no-restricted-classes` and `touch-button-size` work the other way: consumers opt _in_ per folder, because marketing pages and shadcn internals have not had that pass yet. How to satisfy the first: [`docs/i18n.md`](../../docs/i18n.md) section 3.

The design floors behind the last two rules, and the checks lint cannot make (rendered text size, target size, wording), are in [`.cursor/rules/ui-design.mdc`](../../.cursor/rules/ui-design.mdc) and `apps/web/e2e/floors.spec.ts`.
