# Changelog: 2606-WDV349-CantuPhillip 🚀

## Project & Portfolio

### Phillip Cantu

![Degree Program](https://img.shields.io/badge/degree-web%20development-blue.svg)&nbsp;

Each week, and/or each major change, I will update this file by summarizing activity and progress made. This changelog is the source of truth for all changes to the Mnemno app.

## 21 June 2026

### `ANNOUNCEMENT` Monorepo Initialized

I successfully launched the core project codebase architecture for Mnemno, bootstrapping a highly optimized modern monorepo build setup using the official **shadcn/ui** Vite installation instructions ([here](https://ui.shadcn.com/docs/installation/vite)).

* Deployed `dev/mnemno` structural repository.
* Updated the `globals.css` to match my prototype's style tile.
* All other configeration came pre-configured through the shadcn/ui installation.
  * See merged **[PR #39](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/39)** (*Issue32 shadcnui scaffold*)

### `DOCUMENTATION` Milestone 3 Planning Backlog Published

I mapped out the front-end core features directly to GitHub Issues.

* **Frontend Issues Deployed:** Opened 6 dedicated system feature track issues detailing exact execution parameters:
  * `Routes #33`: Type-safe route parameters handled via TanStack Router.
  * `Component #34`: Marketing landing views and interactive concept layouts.
  * `Component #35`: Isolated client auth panels layout screens.
  * `Page #36`: Responsive user decks dashboard and statistics widgets.
  * `State #37`: Client identity session state wrapping Better Auth hooks.
  * `State #38`: Optimistic UI card caching filters using TanStack Query.
* See Milestone: [Front-end I](https://github.com/hereisphil/2606-WDV349-CantuPhillip/milestone/6), and Milestone: [Front-end II](https://github.com/hereisphil/2606-WDV349-CantuPhillip/milestone/7).

***

## 19 June 2026

### `DOCUMENTATION` Milestone 3 Design Theory & Production Planning Research Logs Merged

I finalized and compiled the deep structural research files exploring product delivery lifecycles, atomic components, and interaction behaviors.

* **Design Heuristics (R4-Notes.md):** Documented visual safety parameters targeting the mitigation of coercive dark design patterns, integration rules for accessible focus-trapped dialog modals, and the application of Laws of UX (Miller's and Fitts's Laws).
* **Plans for Production (R5-Notes.md):** Synthesized structural REST API mapping patterns, task scaling metrics using GitHub Issues, and modular layout rules matching Atomic Web Design configurations.
  * See merged **[PR #30](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/30)** (*Research*) — Successfully resolves and **Closes [#23](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/23) and [#25](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/25)**.

***

## 18 June 2026

### `DESIGN` Wireframe to Prototype Migration

I cleaned up of the project repository's design folder tree and created an interactive Figma Prototype of the Mnemo app.

* **Prototype Files:** Added 8 high-fidelity layout screens mapping core workspace views (`01 - Landing page.png` through `08 - Style Tile.png`) into a clean repository folder structure located at `docs/designs/prototypes/images/`.
  * See merged **[PR #29](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/29)** (*Designs*).

***

## 12 June 2026

### `DOCUMENTATION` Milestone 2 Research Logs Merged

Finalized and merged the academic technical research files into the dev branch.

* **Structure & UI Flow (R2-Notes):** Data regarding low-fidelity wireframing strategies, anti-patterns within the "Greybox" philosophy, and responsive website constraints.
* **Style & Identity Systems (R3-Notes):** Documented visual design principles analyzing Style Tiles, brand font selection psychology, color symbolism, and background textures.
* **Workflow Verification:** Successfully reviewed and merged via following FBWF principles.
  * See merged [PR #16](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/16) (*Merge R2/R3-Notes.md*)

### `DESIGN` Low-Fidelity Interactive Wireframes Deployed

Successfully mapped out the UI/UX for the Mnemno core application interfaces.

* **Assets:** Generated and uploaded the Markdown file (`wireframe.md`), AI-prompt source (`prompt.txt`), and images (`.webp`).
* **Location Mapping:** Files are committed directly into the designated project directory at `docs/wires/`.
  * See merged [PR #17](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/17) (*Added wireframe.md, prompt.txt, and webp files*)

### `DESIGN` Brand Style Tile

Published the initial style tile with the intended look-and-feel.

* **Brand Kit Publication:** Generated `StyleTile.md` and included an image (`StyleTile.png`) to establish baseline color typography hierarchies, UI components, and theme states.
* **Directory:** All documentation and assets are stored within `/docs/designs/style-tile`.
  * See merged [PR #18](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/18) (*Style Tile*)

### `ANNOUNCEMENT` GFiletree Schema Updated

Updated our repository file tree map to preserve strict tracking with the newly introduced design, style, and wireframe assets.

* See merged [PR #21](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/21) (*Update Filetree*)

***

## 06 June 2026

### `ANNOUNCEMENT` Branches initialized & Documentation updated

* **Trunk Line & Environment Routing:** Established stable branch tracks:
  * `main`: Production-ready layer; completely locked to ensure zero unstable deployments.
  * `stage`: The pre-flight staging area used for end-to-end integration verification prior to instructor appraisal.
  * `dev`: The central staging sandbox where upcoming features are pull-requested, combined, and sanity-checked.
* **Isolated Feature Tracks:** Configured rolling workspace tracks built off the `dev` branch:
  * `research`: Ongoing technical learning, syntax tracking, and code safety analysis (`docs/research/R1-Notes.md`).
  * `proposal`: Scoping, target market definition, and product positioning tracking (`docs/ProjectProposal.md`).
  * `portfolio`: Dedicated asset bucket (`dev/portfolio`) for code curation, refactoring, and portfolio review work throughout the course cycle.
  * `changelog`: Current active branch hosting system modifications and historical engineering tracking records (`docs/changelog.md`).
  * `filetree`: Tracking the entire ecosystem of the repo's file direcotry (`docs/file.tree`).
* **Docs: Tech Stack Defined:** formally outlined the modern, edge-native technical architecture for Mnemno
  * See closed [PR #6](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/6)
  * See [docs/TechStack.md](./docs/TechStack.md) for full details.
* **Docs: Project Proposal Published:** formalized the directional scope, user metrics, and baseline requirements for the community-driven mnemonic language platform.
  * See closed [PR #6](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/6)
  * See [docs/TechStack.md](./docs/TechStack.md) for full details.
* **Docs: Assigned and Personal Research Completed:** documented reserach on Feature Branch Workflow (FBWF) and Minimum Release Age in Bun Runtime.
  * See [docs/research/R1-Notes.md](./docs/research/R#-Notes.md) for full details, on the `research` and `dev` branches.
* **Docs: Changelog created:** formulally documented weekly changes.
  * See [docs/changelog.md](./docs/changelog.md) for full details, on the `changelog` branch and `dev` branches.
