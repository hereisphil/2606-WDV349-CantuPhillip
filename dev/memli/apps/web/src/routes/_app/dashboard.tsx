import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { DueReviewAlert } from "./-components/DueReviewAlert"
import { LearningQuickStats } from "./-components/LearningQuickStats"
import { ProgressTrends } from "./-components/ProgressTrends"

// Temporary stats for seeded prototype user
const prototypeDueCount = 24
const prototypeTermsLearned = 100
const prototypeDailyReviewsCompleted = 24
const prototypeDailyReviewTarget = 50
const prototypeProgressTrends = {
  consistencyPercent: 98,
  consistencyWeeklyChangePercent: 2,
  retentionPercent: 84,
  retentionGlobalAveragePercent: 75,
  newCardsThisMonth: 142,
  rankLabel: "Top 5%",
  rankCohort: "Among Spanish learners",
}

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  return (
    <Section width="full" padding="compact" className="flex flex-col gap-8">
      <DueReviewAlert
        dueCount={prototypeDueCount}
        stats={
          <LearningQuickStats
            termsLearned={prototypeTermsLearned}
            dailyReviewsCompleted={prototypeDailyReviewsCompleted}
            dailyReviewTarget={prototypeDailyReviewTarget}
          />
        }
      />
      <div>
        <Heading>Decks</Heading>
        <Text variant="muted" className="mt-2">
          Your vocabulary collections will show up here.
        </Text>
      </div>
      <ProgressTrends {...prototypeProgressTrends} />
    </Section>
  )
}
