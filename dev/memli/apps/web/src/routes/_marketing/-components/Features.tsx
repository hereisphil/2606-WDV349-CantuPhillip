import type { JSX } from "react"
import { RefreshCw, Share2, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: RefreshCw,
    title: "Dynamic SRS",
    description:
      "Our proprietary algorithm schedules your reviews at the exact moment you're about to forget.",
  },
  {
    icon: Share2,
    title: "Crowdsourced Hooks",
    description:
      "Access thousands of community-generated images and stories to anchor new words in your mind.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Accuracy",
    description:
      "Content is vetted by native speakers and top contributors to ensure you learn only what's correct.",
  },
]

export function Features(): JSX.Element {
  return (
    <section id="features" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
            Why Memli
          </h2>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            Three things that turn a word you just met into one you never lose.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3 lg:mt-16">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
