# How did I go about the redesign?

First, I was just unhappy with the way the current dashboard was. Not enough color contrast, nothing grabbing the user's eye, too much copy, and too many sections. So I did what all 2026 developers do... Ask AI 😆

## 1st Prompt
> Anthropic Claude Opus 5.5 (medium effort)

```
Are you able to use Claude Google Chrome extension to view and interact with my app?
```

👉 Claude confirmed it could and even opened up a tab as an example.

## 2nd Prompt
> Anthropic Claude Fable 5.2 (high effort + ultracode)

```
View the @docs/designs/dashboards/ designs. View the responses I got from others. View http://192.168.1.105:5173/dashboard.

I want to improve the UI/UX of the user dashboard.

1. I think the page looks too busy. Too much copy.
2. I think there's not enough contrast in colors.
3. I think we need to offer dark mode.
4. I think the human eye is not immediately drawn to one component and a person may feel overwhelmed.

I need your help for a thorough update. I want you to consider:

1. User-friendliness for non-tech-savvy people.
2. Mobile responsiveness.
3. A11y
4. WCAG
5. i18n
6. The old Memrise web app, I used `"memrise" walkthrough OR review before:2019-01-01 after:2016-01-01` on YouTube to find https://www.youtube.com/watch?v=juNdykvLxLA
7. Some wayback machine archives of Memrise https://web.archive.org/web/20160306192808/https://www.memrise.com/, https://web.archive.org/web/20160316115012/https://www.memrise.com/join/, https://web.archive.org/web/20160318075542/http://www.memrise.com/about/, https://web.archive.org/web/20160313184443/http://www.memrise.com/courses/english/languages/, https://web.archive.org/web/20160312124128/http://www.memrise.com/course/12/introduction-to-japanese/, https://web.archive.org/web/20160307055604/http://www.memrise.com/course/12/introduction-to-japanese/2/
8. Tailwind's authors' Refactoring UI book.
9. Color Science: perceptually uniform color spaces (OKLCH or HCT), role-based semantic design tokens, and a dual-contrast accessibility model (WCAG 2.2 + APCA), Tailwind v4 + Tokens, Practical UI Color Engineering Rules, Dark Mode Rules (Never Just Invert), Interaction of Color by Josef Albers (how surrounding colors alter perceived hue and lightness), and Evil Martians' "OKLCH in CSS: why we moved from RGB and HSL".

Spin up several subagents, research, review, and create a thorough plan.

/goal create a REDESIGN.md and place it in `/Users/hereisphil/FullSail/PPIV/2606-WDV349-CantuPhillip/docs/designs`
```

👉 What followed took about an hour and burned a drastic amount of tokens. So much that even though I was only around 10% of my 5-hour limit, I had to use my one and only free reset so it could continue without being interrupted and without me having to wait 5 hours.

You can see all of the research in `docs/designs/redesign-research` and it's A LOT. Then, of course, the summary and actions are in [REDESIGN.md](REDESIGN.md)

## Results

Overall, I'm quite pleased about the results and I learned a lot in the process, and a few custom ESLint rules were made to enforce several of the best practices discovered, like [no-restricted-classes](../../dev/memli/packages/eslint-config/rules/no-restricted-classes.js) throws an error whenever a restricted Tailwind class is used, like text-xs is banned, and my [pre-commit hook](../../lefthook.yml) and [CI Validation](../../.github/workflows/verify.yml).

A further mini-redesign of the marketing landing page will be done, and well as the study session.