# Redesign research

The evidence behind [REDESIGN.md](../REDESIGN.md). Twelve research and design agents wrote these files on 13 November 2026. They are kept as a record. **REDESIGN.md is the plan. Where it disagrees with a file here, REDESIGN.md wins**, because it was corrected after three reviews and these files were not.

## Research

| File | What it covers |
| --- | --- |
| [code-audit.md](./research/code-audit.md) | Every dashboard component, string, number, color and type style, with `file:line` references. |
| [live-audit.md](./research/live-audit.md) | The running page measured in a headless browser: positions, target sizes, every rendered color pair, axe results. |
| [feedback-examples.md](./research/feedback-examples.md) | The five example images and the four responses. |
| [memrise-archive.md](./research/memrise-archive.md) | The 2016 to 2017 Memrise dashboard and public pages, recovered from archived pages, CSS and a video walkthrough. |
| [refactoring-ui.md](./research/refactoring-ui.md) | The book's ideas applied to this page, element by element. |
| [color-science.md](./research/color-science.md) | OKLCH, HCT, tokens, WCAG and APCA, dark mode, Albers, and the verified token set. |
| [a11y-usability.md](./research/a11y-usability.md) | WCAG 2.2, cognitive accessibility, plain language, streak ethics, a 72-item checklist and the test scripts. |
| [mobile-i18n.md](./research/mobile-i18n.md) | Phone measurements, pseudo-localization, plural and text-growth rules. |
| [competitors-attention.md](./research/competitors-attention.md) | How other learning apps build one focal point, and the attention research behind it. |

## Proposals

Three independent designs built on the research. REDESIGN.md takes "Night first" as its base.

| File | Angle |
| --- | --- |
| [night-first.md](./proposals/night-first.md) | Dark navy first, then light. Strong surface contrast and a visible theme control. |
| [calm-focus.md](./proposals/calm-focus.md) | One column, one focal point, the fewest words. |
| [playful-memory.md](./proposals/playful-memory.md) | A memory postcard, a growth picture per course, a calendar. |

## Color scripts

| File | What it is |
| --- | --- |
| [tokens.mjs](./color/tokens.mjs) | The source of truth for the proposed colors and roles. |
| [verify.mjs](./color/verify.mjs) | Checks every pairing against WCAG 2.2 and APCA. |
| [proposed-tokens.css](./color/proposed-tokens.css) | The generated CSS (also in REDESIGN.md's appendix). |
| [results.md](./color/results.md) | The full table of checked pairings. |
| [preview.png](./color/preview.png) | A static mock of the tokens. Not the real page. |

To rerun the check, install the two packages listed in `color/package.json` (`culori` and `apca-w3`) in that folder, then run:

```bash
node verify.mjs
```

## Read these with care

- **Known differences from the plan.** All three proposals include a phone bottom bar, a "Home" nav label and a "Language" filter label. REDESIGN.md dropped or changed each of these after review.
- **A correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark was the owner's, about himself. The affected lines were corrected and each affected file carries a note.
- **Paths.** `scratch/…`, `session-screenshots/…` and `feedback-screenshots/…` point at temporary files from the working session that were not saved, including 76 screenshots of the current page.
- **Nothing was built.** Sizes in the proposals are arithmetic, and contrast figures were computed by script.
