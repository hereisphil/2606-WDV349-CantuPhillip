import type { JSX } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router"
import type { CatalogCourse } from "@workspace/schemas/api/catalog"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Spinner } from "@workspace/ui/components/spinner"
import { Text } from "@workspace/ui/components/text"
import { LanguageMenu } from "@/components/language-menu"
import { catalogQuery } from "@/lib/queries"
import { CatalogList } from "../-components/CatalogList"
import { CatalogPreviewSwitcher } from "../-components/CatalogPreviewSwitcher"
import {
  catalogPreviews,
  isCatalogPreviewName,
  type CatalogPreviewName,
} from "../-components/catalog-previews"

const messages = {
  title: "Courses · Memli",
  heading: "Courses",
  intro: "Pick a course to start learning. Each word comes with a story.",
  filterLabel: "Language",
  filterTrigger: "Language: {language}",
  empty: {
    heading: "No courses yet",
    body: "New courses are on the way. Check back soon.",
  },
  loading: "Loading courses",
  error: {
    heading: "We couldn't load the courses",
    body: "Check your connection, then try again.",
    retry: "Try again",
  },
} as const

type CatalogSearch = {
  preview?: CatalogPreviewName | undefined
  /** BCP 47 tag of the learning language to show. Absent means all. */
  language?: string | undefined
}

const languageTagPattern = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/

/** The learning languages on offer, each once, in the order they first appear. */
function languagesOf(courses: readonly CatalogCourse[]): string[] {
  return [...new Set(courses.map((course) => course.learningLanguage))]
}

// Public (#174): the `_catalog` layout never sends a visitor to /signin.
// Every key is always set, even to undefined, because the router merges raw params into this result.
export const Route = createFileRoute("/_catalog/courses/")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    preview:
      import.meta.env.DEV && isCatalogPreviewName(search.preview)
        ? search.preview
        : undefined,
    language:
      typeof search.language === "string" &&
      languageTagPattern.test(search.language)
        ? search.language
        : undefined,
  }),
  head: () => ({ meta: [{ title: messages.title }] }),
  // A preview is a fixed snapshot and never asks the API.
  loaderDeps: ({ search }) => ({
    preview: search.preview,
    language: search.language,
  }),
  loader: async ({ context, deps }) => {
    if (deps.preview !== undefined) return
    const courses = await context.queryClient.ensureQueryData(catalogQuery)
    // A ?language= no course teaches is stale: drop it before the page renders.
    if (
      deps.language !== undefined &&
      !languagesOf(courses).includes(deps.language)
    ) {
      throw redirect({ to: "/courses", search: {}, replace: true })
    }
  },
  component: Catalog,
  pendingComponent: CatalogPending,
  errorComponent: CatalogError,
})

function Catalog(): JSX.Element {
  const { preview } = Route.useSearch()
  if (import.meta.env.DEV && preview !== undefined) {
    const seeded = catalogPreviews[preview]
    const switcher = (
      <div className="px-4 pt-4 sm:px-6 sm:pt-8">
        <CatalogPreviewSwitcher current={preview} />
      </div>
    )
    if (seeded.loadFailed === true || seeded.loading === true) {
      return (
        <>
          {switcher}
          {seeded.loading === true ? (
            <CatalogPending />
          ) : (
            <CatalogError error={new Error("preview")} reset={() => {}} />
          )}
        </>
      )
    }
    return <CatalogView courses={seeded.courses} />
  }
  return <LiveCatalog />
}

function LiveCatalog(): JSX.Element {
  const { data: courses } = useSuspenseQuery(catalogQuery)
  return <CatalogView courses={courses} />
}

function CatalogView({
  courses,
}: {
  courses: readonly CatalogCourse[]
}): JSX.Element {
  const search = Route.useSearch()
  const languages = languagesOf(courses)
  // Previews skip the loader, so a stale ?language= is ignored here too.
  const language =
    search.language !== undefined && languages.includes(search.language)
      ? search.language
      : undefined
  const shown =
    language === undefined
      ? courses
      : courses.filter((course) => course.learningLanguage === language)

  return (
    <Section
      padding="compact"
      className="flex max-w-3xl flex-col gap-6 px-4 pt-4 pb-12 sm:gap-8 sm:px-6 sm:pt-8"
    >
      {import.meta.env.DEV && search.preview !== undefined ? (
        <CatalogPreviewSwitcher current={search.preview} />
      ) : null}
      {/* Stacked, never side by side: the menu's label changes width with the
          choice, so sharing a line with the heading made it jump. */}
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col gap-2">
          <Heading level={1} size="2">
            {messages.heading}
          </Heading>
          <Text variant="muted">{messages.intro}</Text>
        </div>
        {languages.length > 1 ? (
          <LanguageMenu
            languages={languages}
            current={language}
            label={messages.filterLabel}
            trigger={messages.filterTrigger}
            link={(tag, isCurrent) => (
              <Link
                from="/courses/"
                to="/courses"
                search={(prev) => ({ ...prev, language: tag })}
                resetScroll={false}
                aria-current={isCurrent ? "true" : undefined}
              />
            )}
          />
        ) : null}
      </div>
      {courses.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-border-strong p-6">
          <Heading level={2} size="4">
            {messages.empty.heading}
          </Heading>
          <Text variant="muted">{messages.empty.body}</Text>
        </div>
      ) : (
        <CatalogList courses={shown} />
      )}
    </Section>
  )
}

/** Shown only if the courses take more than a second to arrive. */
function CatalogPending(): JSX.Element {
  return (
    <Section padding="compact" className="px-4 pt-4 sm:px-6 sm:pt-8">
      <div
        role="status"
        className="flex items-center gap-3 text-muted-foreground"
      >
        <Spinner />
        <Text variant="muted">{messages.loading}</Text>
      </div>
    </Section>
  )
}

function CatalogError({ reset }: ErrorComponentProps): JSX.Element {
  const router = useRouter()
  return (
    <Section padding="compact" className="px-4 pt-4 sm:px-6 sm:pt-8">
      <div
        role="alert"
        className="flex max-w-xl flex-col items-start gap-4 rounded-xl border border-border bg-card p-6"
      >
        <Heading level={1} size="3">
          {messages.error.heading}
        </Heading>
        <Text variant="muted">{messages.error.body}</Text>
        <Button
          size="touch"
          onClick={() => {
            reset()
            void router.invalidate()
          }}
        >
          {messages.error.retry}
        </Button>
      </div>
    </Section>
  )
}
