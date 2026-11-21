import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { LegalPage } from "./-components/LegalPage"

export const Route = createFileRoute("/_marketing/privacy")({
  component: Privacy,
})

/**
 * Every promise here is backed by code: the tables in apps/api/src/db/schema.ts
 * and the daily cleanup in apps/api/src/lib/cleanup.ts. See docs/security.md.
 */
const messages = {
  title: "Privacy Policy",
  updated: "2026-11-20",
  intro: [
    "This page explains what Memli stores about you, why, and how long.",
    "We collect only what Memli needs to work. We never sell your data.",
  ],
  sections: [
    {
      id: "what-we-collect",
      title: "What we collect",
      body: [
        "<strong>Your account.</strong> When you sign up, we store:",
        {
          list: [
            "The name you choose. Other learners see it under mnemonics you share.",
            "Your email address",
            "Your password, only as a scrambled hash. We never see the password itself.",
            "The language you use Memli in",
          ],
        },
        "<strong>Your learning.</strong> As you study, we store:",
        {
          list: [
            "The courses you add, and when you added them",
            "For each word, how well you know it and its next review",
            "A log of every review: the word, how it went, when, and how long you took",
          ],
        },
        "We do not store the answers you type.",
        "<strong>Your mnemonics.</strong> Mnemonics you share are stored with your name.",
        "<strong>Signing in.</strong> Each browser you sign in on gets a session. It holds a cookie, your IP address and your browser’s name.",
        "<strong>Stopping abuse.</strong> Some actions count requests per IP address, to stop attacks. They are sign-up, sign-in, saving reviews, and adding or browsing courses. Browsing is public, so this includes visitors without an account.",
        "<strong>On your device.</strong> Your browser remembers your light or dark theme. It stays on your device.",
      ],
    },
    {
      id: "what-we-do-not-do",
      title: "What we do not do",
      body: [
        {
          list: [
            "We do not sell or share your personal information.",
            "We do not show ads.",
            "We do not use analytics or tracking tools.",
            "We do not use cookies from other companies.",
          ],
        },
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      body: [
        {
          list: [
            "To run your account and keep you signed in",
            "To plan your reviews and show your progress",
            "To show your name with the mnemonics you share",
            "To keep accounts safe and stop attacks",
          ],
        },
        "Under the GDPR, we need the first three to provide Memli.",
        "Keeping Memli safe is our legitimate interest.",
      ],
    },
    {
      id: "who-else",
      title: "Who else sees it",
      body: [
        "<strong>Cloudflare</strong> hosts Memli’s servers and database. It handles your data only to run Memli for us.",
        "<strong>Have I Been Pwned</strong> checks new passwords against known data breaches. We send only the first five characters of a hash of it. The service never learns your password or your email.",
        "<strong>Other learners</strong> see your name and the mnemonics you share. They never see your email or your study history.",
        "We share data with the authorities only when the law requires it.",
      ],
    },
    {
      id: "how-long",
      title: "How long we keep it",
      body: [
        {
          list: [
            "Your account and learning data: until you delete your account",
            "A session: until you sign out, or 7 days after your last visit. We delete it within a day after that.",
            "Request counts with your IP address: deleted within 2 days of your last request",
            "Database backups: up to 30 days",
          ],
        },
        "If you delete your account, mnemonics you shared stay without your name. Ask us, and we will delete them too.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: [
        "Wherever you live, you can ask us to:",
        {
          list: [
            "Send you a copy of your data",
            "Correct something that is wrong",
            "Delete your account and your data",
            "Stop using your data for a purpose you object to",
          ],
        },
        "Email <email>{email}</email> from the address on your account. We reply within 30 days.",
        "There is no delete button yet. Until there is, we delete accounts by hand.",
        "Deleting your account removes your sessions, courses, progress and review log.",
        "You can also complain to your local data protection authority.",
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [
        "Memli is for people 13 and older. We do not knowingly collect data from children under 13.",
        "Think a child under 13 has an account? Email <email>{email}</email>, and we will delete it.",
      ],
    },
    {
      id: "security",
      title: "Keeping your data safe",
      body: [
        "Memli only works over an encrypted connection. Passwords are stored as hashes, never as text.",
        "Your sign-in cookie cannot be read by scripts on the page.",
        "No system is perfectly safe. If a breach affects you, we will tell you.",
      ],
    },
    {
      id: "where",
      title: "Where your data is",
      body: [
        "Cloudflare’s servers are around the world, including the United States.",
        "Your data may be stored or handled outside your country.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: [
        "We may update this policy as Memli changes. The date at the top shows the latest version.",
        "We will email you about important changes before they take effect.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      body: [
        "Questions about your privacy? Email <email>{email}</email>.",
        "Memli is run by Phillip Cantu in Arizona, USA. Our <terms>Terms of Service</terms> apply too.",
      ],
    },
  ],
} as const

function Privacy(): JSX.Element {
  return (
    <LegalPage
      title={messages.title}
      updated={messages.updated}
      intro={messages.intro}
      sections={messages.sections}
    />
  )
}
