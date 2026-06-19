# Research Notes

A running log of weekly research for the Project & Portfolio IV course. Each file covers the main assignment topic plus any personal deep-dives that came up along the way.

---

## [R1 — Feature Branch Workflow](R1-Notes.md)

**Due:** Jun 7, 2026

The big idea here is keeping production safe by never committing directly to `main`. The workflow is: Feature Branch → Dev → Stage → Main, with PRs at each step and branch cleanup once things merge.

Also went down a rabbit hole on NPM supply chain attacks and figured out how to set a **minimum release age** in Bun via `bunfig.toml`.

---

## [R2 — Application Structure & Lo-Fi Wireframing](R2-Notes.md)

**Due:** Jun 14, 2026

Wireframes are blueprints, not mockups. The whole point is to nail down layout, content hierarchy, and user flows *before* touching colors or fonts. The "greybox" philosophy keeps stakeholders focused on structure instead of getting distracted by branding decisions.

Key takeaway: start with a user goal, write the map to get there, then wireframe the screen states.

---

## [R3 — Style, Branding & Visual Identity](R3-Notes.md)

**Due:** Jun 14, 2026

Covers Style Tiles as the missing link between wireframes and full mockups, basically a guide for typography, color palettes, and UI primitives. Color isn't just decoration, it's psychology. Textures can add depth but need to stay subtle so they don't become noise.

This research lines up nicely with my choice of using Tailwind + `shadcn/ui` since the component-driven approach mirrors the Style Tile system.

---

## [R4 — Design Theory & UX Engineering](R4-Notes.md)

**Due:** Jun 21, 2026

Digs into the "why" behind interface decisions. Miller's Law, Fitts's Law, accessible modal patterns, and why dark patterns like confirmshaming are a bad idea for an educational app. Also covers WCAG white space guidelines and how they reduce visual fatigue during heavy study sessions.

The Laws of UX site and the Atomic A11y modal guide were the standout resources here.

---

## [R5 — Production Planning, APIs & Components](R5-Notes.md)

**Due:** Jun 21, 2026

Focuses on translating designs into an actual coding workflow: clean REST API design (plural nouns, proper HTTP methods, standard status codes), using GitHub Issues as a real project plan instead of just a to-do list, and breaking the UI down using Atomic Design principles.

The React "Thinking in React" docs + the GitHub Issues quickstart made it click how to map UI components directly to issues in the repo.
