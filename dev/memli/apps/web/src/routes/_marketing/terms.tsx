import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { TERMS_VERSION } from "@workspace/schemas/auth/sign-up"
import { LegalPage } from "./-components/LegalPage"

export const Route = createFileRoute("/_marketing/terms")({
  component: Terms,
})

/**
 * Plain language on purpose, so a 13 year old can follow it (#170).
 * Bump `TERMS_VERSION` when a change matters: sign-up then asks again.
 */
const messages = {
  title: "Terms of Service",
  updated: TERMS_VERSION,
  intro: [
    "These terms are the rules for using Memli. Please read them before you sign up.",
    "By creating an account or using Memli, you agree to them.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: [
        "Memli is a language learning app. Phillip Cantu runs it from Arizona, USA.",
        "In these terms, “we” and “us” mean Memli. “You” means the person using Memli.",
        "Memli is in beta. Features may change, and some things may break.",
        "Memli is free during the beta. We will tell you before anything costs money.",
      ],
    },
    {
      id: "age",
      title: "Who can use Memli",
      body: [
        "You must be 13 or older to use Memli.",
        "If you are under 18, a parent or guardian must also agree.",
        "We do not knowingly collect data from children under 13. We delete any account we learn belongs to a child under 13.",
        "Think a child under 13 is using Memli? Email <email>{email}</email>.",
      ],
    },
    {
      id: "account",
      title: "Your account",
      body: [
        {
          list: [
            "Use a real email address, and keep your password private.",
            "One account is for one person.",
            "You are responsible for what happens on your account.",
            "Tell us right away if someone else gets into it.",
          ],
        },
        "You can ask us to delete your account at any time. Email <email>{email}</email> from the address on your account.",
        "Our <privacy>Privacy Policy</privacy> says what we delete and what we keep.",
      ],
    },
    {
      id: "your-mnemonics",
      title: "Your mnemonics",
      body: [
        "Mnemonics are stories or images that help you remember words.",
        "You own the mnemonics you write or upload. To show them in Memli, we need your permission.",
        "When you share a mnemonic, you give Memli a license to:",
        {
          list: [
            "Store it, copy it and show it to other learners in Memli",
            "Resize or reformat it so it fits any screen",
          ],
        },
        "This license is free, worldwide and not exclusive. You can still use your mnemonics anywhere else.",
        "The license ends when you delete the mnemonic. Backup copies may stay for a short time.",
        "Deleting your account does not delete mnemonics you shared. They stay in Memli without your name. Other learners may be studying with them. Ask us, and we will remove them too.",
        "Only share what you have the right to share. Do not upload images or text you copied from someone else. This includes memes, movie stills and song lyrics.",
      ],
    },
    {
      id: "our-content",
      title: "Memli’s content",
      body: [
        "Courses, words and Memli’s own mnemonics belong to us or our partners.",
        "You may use them to learn for yourself. Do not copy, sell or republish them without our permission.",
        "Do not use the Memli name or logo to pose as us.",
      ],
    },
    {
      id: "community-rules",
      title: "Community rules",
      body: [
        "Mnemonics work best when they are strange, funny or a little rude. That is fine. Hurting people is not.",
        "Do not post anything that:",
        {
          list: [
            "Attacks people for their race, religion, gender, sexuality, disability or origin",
            "Harasses, threatens or bullies someone",
            "Is sexually explicit, or sexualizes a minor in any way",
            "Shares someone’s private information, like an address or phone number",
            "Pretends to be another person, or to be Memli",
            "Breaks the law, or helps someone else break it",
            "Is spam, an ad or a link to a scam",
            "Copies someone else’s work without permission",
          ],
        },
        "Our <conduct>Community Code of Conduct</conduct> shows examples of both.",
      ],
    },
    {
      id: "reporting",
      title: "Reporting content",
      body: [
        "See something that breaks these rules? Email <email>{email}</email>. Say which course and word it is on, and why.",
        "We read every report. We remove content that breaks the law or these terms.",
        "If we remove something you posted, we will tell you why. You can ask us to look again.",
      ],
    },
    {
      id: "copyright",
      title: "Copyright complaints",
      body: [
        "Think something in Memli copies your work? Send a notice to <email>{email}</email>. Your notice needs:",
        {
          list: [
            "Your name, address, phone number and email",
            "The work you own, or a link to it",
            "Where the copy is in Memli: the course and the word",
            "A statement that, in good faith, you believe the use is unauthorized",
            "A statement that the information in your notice is accurate",
            "A statement, under penalty of perjury, that you act for the owner",
            "Your physical or electronic signature",
          ],
        },
        "We will remove the content and tell the person who posted it.",
        "Think we removed your work by mistake? Send us a counter notice. Tell us what was removed and why it was a mistake.",
        "We follow the US Digital Millennium Copyright Act (DMCA) for both.",
        "We close accounts that repeatedly post other people’s work. Sending a false notice on purpose can make you liable for damages.",
      ],
    },
    {
      id: "ending",
      title: "Ending your use of Memli",
      body: [
        "You can stop using Memli at any time.",
        "We may suspend or close an account that breaks these terms. We will tell you why, unless the law forbids it.",
        "We may also end the beta or shut Memli down. We will email you before that happens.",
      ],
    },
    {
      id: "no-guarantees",
      title: "No guarantees",
      body: [
        "We work hard to keep Memli running and your data safe.",
        "Still, we provide Memli “as is,” without warranties of any kind. We do not promise it will always work, or work without errors.",
        "We do not promise you will reach any level in a language.",
        "Mnemonics from other learners belong to them, not to us. We do not check each one before it appears.",
      ],
    },
    {
      id: "liability",
      title: "Limits on our liability",
      body: [
        "Where the law allows, we are not liable for indirect losses. This includes lost data, lost time or lost profits.",
        "Our total liability to you is at most 50 US dollars.",
        "Some places do not allow these limits. There, they may not apply to you.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: [
        "We may update these terms as Memli grows. The date at the top shows the latest version.",
        "We will email you about important changes before they take effect.",
        "If you keep using Memli after that, you accept the new terms.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      body: [
        "The laws of Arizona, USA, apply to these terms.",
        "Disputes go to the state or federal courts in Arizona.",
        "If your country gives you more rights, you keep them.",
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      body: ["Questions about these terms? Email <email>{email}</email>."],
    },
  ],
} as const

function Terms(): JSX.Element {
  return (
    <LegalPage
      title={messages.title}
      updated={messages.updated}
      intro={messages.intro}
      sections={messages.sections}
    />
  )
}
