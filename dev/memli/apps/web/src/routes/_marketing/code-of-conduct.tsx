import type { JSX, ReactNode } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { LegalPage } from "./-components/LegalPage"

export const Route = createFileRoute("/_marketing/code-of-conduct")({
  component: CodeOfConduct,
})

/**
 * What is fine because it is memorable, and what is not (#170, R9-Notes).
 * Examples tag their Spanish and French words, so screen readers say them.
 */
const messages = {
  title: "Community Code of Conduct",
  updated: "2026-11-20",
  intro: [
    "Memli learners share mnemonics to help each other remember words. These rules keep that space useful and kind.",
    "They add detail to the community rules in our <terms>Terms of Service</terms>.",
  ],
  sections: [
    {
      id: "weird-is-welcome",
      title: "Weird is welcome",
      body: [
        "The best mnemonics are often strange, silly or a little gross. Your brain remembers what surprises it.",
        "All of these are fine:",
        {
          list: [
            "A silly sound-alike: for Spanish <es>sopa</es> (soup), soap floating in soup",
            "Bathroom humor: for French <fr>poubelle</fr> (trash can), a smelly “poo bell”",
            "Cartoon slapstick: for Spanish <es>pato</es> (duck), a duck hit by a flying pot",
            "A mild swear word, if it helps you remember",
            "A joke about yourself, or about learning a language",
            "A movie or song you describe in your own words",
          ],
        },
      ],
    },
    {
      id: "the-line",
      title: "Where the line is",
      body: [
        "A mnemonic can be rude. It cannot hurt people. Do not post:",
        {
          list: [
            "Slurs, even as a sound-alike for a word",
            "Jokes that put down a group of people",
            "Stereotypes about the people who speak a language",
            "Sexual jokes or images. Memli is for learners 13 and up.",
            "Gore, self-harm, or threats against anyone",
            "Content that promotes illegal drugs or weapons",
            "Real private people, like a classmate, a teacher or an ex",
            "Anyone’s address, phone number or other private information",
            "Memes, movie stills, logos or song lyrics you did not make",
            "Ads, spam or links to scams",
            "Anything that pretends to be from Memli",
          ],
        },
        "A Spanish mnemonic should never mock Spanish speakers. The same goes for every language.",
      ],
    },
    {
      id: "quick-test",
      title: "A quick test",
      body: [
        "Not sure about a mnemonic? Ask yourself:",
        {
          list: [
            "Would I show it to a classmate I just met?",
            "Is the joke on a group of people?",
            "Did I make it, or may I share it?",
          ],
        },
        "If an answer worries you, choose a different picture or story.",
      ],
    },
    {
      id: "reporting",
      title: "Reporting a mnemonic",
      body: [
        "See a mnemonic that breaks these rules? Email <email>{email}</email>.",
        "Tell us the course, the word and what is wrong.",
        "We do not tell the author who reported them.",
      ],
    },
    {
      id: "enforcement",
      title: "What happens next",
      body: [
        "We read every report. If a mnemonic breaks these rules, we remove it.",
        "We tell the author which rule it broke.",
        "Serious or repeated problems can get an account suspended or closed.",
        "Slurs, threats or sexual content can close an account right away.",
        "We report content that sexualizes a minor to the authorities.",
        "Think we got it wrong? Email <email>{email}</email>, and we will look again.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this code",
      body: [
        "We may update this code as the community grows. The date at the top shows the latest version.",
      ],
    },
  ],
} as const

/** Example words in the course's language, so a screen reader uses its voice. */
const tags = {
  es: (chunk: string): ReactNode => <span lang="es">{chunk}</span>,
  fr: (chunk: string): ReactNode => <span lang="fr">{chunk}</span>,
}

function CodeOfConduct(): JSX.Element {
  return (
    <LegalPage
      title={messages.title}
      updated={messages.updated}
      intro={messages.intro}
      sections={messages.sections}
      tags={tags}
    />
  )
}
