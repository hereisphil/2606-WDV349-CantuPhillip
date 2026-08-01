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
    <section id="features" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 text-center sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-tint text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
