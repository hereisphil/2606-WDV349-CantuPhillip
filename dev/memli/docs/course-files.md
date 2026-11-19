# Course files

A course reaches a real database as one JSON file (#174). The import script (`bun run db:import-course`, in [`apps/api/README.md`](../apps/api/README.md#importing-a-course)) reads the file, checks it, and adds or updates the course, its words and their starter mnemonics. The prototype seed (`apps/api/seed/prototype.sql`) is for local development and staging only; course files are how real courses reach staging and production.

The schema is `courseFileSchema` in [`@workspace/schemas/content/course-file`](../packages/schemas/src/content/course-file.ts). A full, valid example is [`course-file.example.json`](./course-file.example.json), and a test parses it, so this page and the schema can't drift apart.

## The shape

```json
{
  "format": "memli-course/1",
  "course": { "courseId": "spanish-kitchen", "title": "…", "…": "…" },
  "cards": [{ "cardId": "es-kitchen-cocinar", "term": "cocinar", "…": "…" }]
}
```

### `format`

Always `"memli-course/1"`. A later version of the format gets a new value, so an old file is never read as a new one.

### `course`

| Field | Holds |
| --- | --- |
| `courseId` | The course's id, 1 to 64 characters. Lowercase words joined by hyphens: `spanish-kitchen` |
| `title` | The name learners see |
| `learningLanguage` | What the course teaches: the language of each word. A language tag such as `es`, `pt-BR` or `ja` |
| `answerLanguage` | What the meanings and translations are written in. A language tag |
| `description` | A sentence or two for the catalog, in `answerLanguage`. Up to 280 characters |
| `published` | `true` lists it in the catalog. `false` imports it as a hidden draft |
| `source` | Who wrote the words, or the dataset they came from: `Written for Memli`, `Tatoeba Project, tatoeba.org` |
| `license` | The license, as learners see it: `CC BY 4.0`, `CC BY-SA 4.0`, `All rights reserved` |
| `attribution` | The credit line the license asks for. Leave it out when the license asks none |

`description`, `source` and `license` are always required, even for a draft, so every course says what it teaches and where its words came from before anyone can publish it.

### `cards`

One entry per word, **in the order learners meet them**: the first card is position 1. Reordering the file reorders the course.

| Field | Holds |
| --- | --- |
| `cardId` | The word's id. **Unique across every course**, not just this file, so start it with the course: `es-kitchen-cocinar` |
| `term` | The word or phrase, in `learningLanguage` |
| `partOfSpeech` | `noun`, `verb`, `adjective`, `adverb` or `phrase` |
| `gender` | `masculine`, `feminine` or `neuter`, only for words that have one |
| `answers` | Every accepted meaning, in `answerLanguage`. The first is the one shown on reveal |
| `phonetic` | IPA, or a romanization for non-Latin scripts |
| `example` | `{ "text": "…", "translation": "…" }`: a sentence using the word, and what it means |
| `mnemonics` | Up to 3 starter mnemonics. Optional |

At least one card, and at most 5,000.

### Starter mnemonics

The same shape a learner's mnemonic has, without what belongs to learners:

| Field | Holds |
| --- | --- |
| `mnemonicId` | Unique across every course. Start it with `mn-` and the card: `mn-es-kitchen-cocinar-1` |
| `contentLocale` | What the story is written in. A language tag, usually `answerLanguage` |
| `story` | Parts, never markup: `plain` text, the `term` being learned, and the `keyword` that sounds like it |
| `image` | Optional: `{ "src": "/mnemonics/…", "alt": "…" }`. A path on Memli's own site, and a description of the picture |

No `author` and no `upvotes`: votes come from learners. The import credits every starter mnemonic to **Memli**, so the study screen shows "By Memli" like any other author.

## Rules the schema enforces

- **Unknown keys are refused.** A misspelled `attributon` fails the check instead of quietly disappearing.
- **No blank text.** Spaces alone don't count as a description, source or license. The database refuses blank ones for published courses too.
- **No repeated ids.** Two cards can't share a `cardId`, and two mnemonics can't share a `mnemonicId`, even on different cards. The error names each one.
- **The same limits as the API.** Language tags, ids, parts of speech, story length and picture paths follow the schemas the API already sends, so an imported course is always one the app can show.

## Where course content can come from

- **Written for Memli.** Ours to license as we choose.
- **Openly licensed sources** whose license allows it, with `source`, `license` and `attribution` filled in as that license asks: for example CC BY or CC BY-SA datasets.
- **Not shared Anki decks.** AnkiWeb's terms allow personal study only, so republishing a deck as a course is redistribution. See "Out of scope" in #174.
