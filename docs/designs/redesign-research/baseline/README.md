# Baseline test kit (#151, phase 0)

Run these two tests on the **current** dashboard before any redesign work lands. They give the redesign something to beat. The same tests run again in phase 6 on the new page.

The scripts come from [REDESIGN.md section 14.2](../../REDESIGN.md). This page adds the images, the setup and a sheet to fill in.

## What you need

| For | Use |
| --- | --- |
| Five-second test, on a phone | [phone-light.png](./phone-light.png) or [phone-dark.png](./phone-dark.png) |
| Five-second test, on a laptop | [desktop-light.png](./desktop-light.png) or [desktop-dark.png](./desktop-dark.png) |
| First-click test | The live page. On your network, open `http://<your computer's IP>:5173/dashboard` on their phone, or `localhost` on your laptop. The dev server already listens on the network. |
| Reference only | The `-full.png` files show the whole page, scrolled. Do not use them for the five-second test. |

The images were captured on 14 November 2026 from `dev` at commit `e353db2`, in headless Brave, at 390 x 844 (phone) and 1440 x 900 (desktop), with the developer tools hidden. Measured at capture: 218 words in `main`, "Start review" ending at y 625 on the phone, and a 2,658 px tall phone page.

**Before the first-click test,** set the theme to the person's choice. There is no visible switch yet: press the `d` key on a laptop, or set it from the browser's developer console with `localStorage.setItem("theme", "dark")` and reload. Do this before they sit down.

## How to run it

- **One person at a time,** on their own device and in the theme they prefer. Anyone who prefers dark also does the five-second test once in light, on a different day.
- **Five-second test:** show the image full screen. Count five seconds silently. Hide it. Then ask the questions.
- **First-click test:** read each task aloud. Start a timer when you finish the sentence. Stop at their first click or tap. Do not let them go further. Go back to the dashboard before the next task.
- **Write down their exact words.** Do not prompt, and do not show the screen again during the five-second questions.

Say this first, word for word:

> "I'm testing a design, not you. There are no wrong answers. If something is confusing, that is the design's fault and it is exactly what I need to know."

## Five-second test

Ask in this order:

1. What is the first thing you remember seeing?
2. What do you think this page is for? What does it want you to do?
3. Was there a button? What did it say?
4. Do you remember any numbers? What were they about?
5. How did the page feel? (Offer no words to choose from.)
6. Was anything hard to read?

## First-click test

The tasks avoid the words on the buttons, so people cannot match text.

| # | Say this | Correct first click on today's page |
| --- | --- | --- |
| T1 | "You have five minutes free. You want to go over words you have already started." | "Start review" |
| T2 | "Now you would rather pick up some brand new words." | "Learn 10 new words" |
| T3 | "You want to work on your Japanese today, not Spanish." | The "Japanese" chip, or "Review" on the Japanese row |
| T4 | "The screen is too bright for you. Change it." (If they are in dark: "too dark for you".) | Nothing on today's page can do this. Note where they look and for how long, then stop after 20 seconds. |
| T5 | "Without clicking: how many days in a row have you studied?" | They say 12 |

Then, with the page still visible:

1. Point at "24 cards ready to review" and ask: "In your own words, what does this line mean?"
2. Point at "Start review" and ask: "If you press this, what happens, and how long will it take?"
3. Point at "Spanish Core 1000" and ask: **"What would you call this?"** Do not say "deck" or "course". Write down the noun they use.
4. Ask: **"Which word fits best: deck, course, list, or set?"**

Questions 3 and 4 test the "course" decision with evidence before anything is renamed.

## What a pass looks like on the redesign

Today's page is not expected to pass. These are the targets the redesign must meet in phase 6, so record today's results against the same lines.

| Test | Pass on the redesign |
| --- | --- |
| First thing remembered is the main panel (the number, the course or the button) | 3 of 4 |
| Purpose described as reviewing or studying words | 4 of 4 |
| Button recalled as "Start review" or close | 3 of 4 |
| Nobody ties the big number to the goal or the streak | 0 of 4 |
| Nobody says the page felt busy or crowded | 0 of 4 |
| Nobody reports text that was hard to read | 0 of 4, in either theme |
| T1 correct | 4 of 4, within 5 seconds |
| T2, T3, T4, T5 correct | 3 of 4 each, within 10 seconds |

Four people is a smoke alarm, not a statistic. One miss is a signal. Two is a problem.

## Recording sheet

Copy this block once per person into [results.md](./results.md). Use first names only, and leave out anything about health, age or eyesight.

```markdown
### <first name>, <date>

- Device and theme: <phone or laptop>, <light or dark>
- Image shown: <file name>

**Five-second test**

| Question | Their words |
| --- | --- |
| 1. First thing remembered | |
| 2. What the page is for | |
| 3. The button | |
| 4. Numbers | |
| 5. How it felt | |
| 6. Hard to read | |

**First-click test**

| Task | Where they clicked | Seconds | Correct? |
| --- | --- | ---: | --- |
| T1 Go over started words | | | |
| T2 New words | | | |
| T3 Japanese | | | |
| T4 Too bright | | | |
| T5 Days in a row | | | |

**Questions**

| Question | Their words |
| --- | --- |
| What "24 cards ready to review" means | |
| What "Start review" does, and how long | |
| What they would call "Spanish Core 1000" | |
| Deck, course, list or set | |

Anything else they said:
```

## When it is done

Fill in [results.md](./results.md), then check the phase 0 task on [#151](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/151). If three of four people do not choose "course", raise it before phase 3, because that is where the words change.
