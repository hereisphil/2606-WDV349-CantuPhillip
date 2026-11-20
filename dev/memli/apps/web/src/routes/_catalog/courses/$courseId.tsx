import type { JSX } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import {
  createFileRoute,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router"
import type { CatalogCourseDetail } from "@workspace/schemas/api/catalog"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Spinner } from "@workspace/ui/components/spinner"
import { Text } from "@workspace/ui/components/text"
import { cn } from "@workspace/ui/lib/utils"
import { useOptionalViewer } from "@/components/session-provider"
import { ApiError } from "@/lib/api"
import {
  catalogCourseQuery,
  catalogQuery,
  coursesQuery,
  setCourseAdded,
} from "@/lib/queries"
import { courseAction } from "@/routes/_app/-components/dashboard-model"
import { catalogPageClass } from "../-components/catalog-layout"
import { BackToCourses, CourseOverview } from "../-components/CourseOverview"
import {
  OverviewActions,
  type OverviewOutcome,
  type OverviewViewer,
} from "../-components/OverviewActions"
import { OverviewPreviewSwitcher } from "../-components/OverviewPreviewSwitcher"
import {
  isOverviewPreviewName,
  overviewPreviews,
  type OverviewPreviewName,
} from "../-components/overview-previews"

const messages = {
  title: "{course} · Memli",
  fallbackTitle: "Course · Memli",
  loading: "Loading the course",
  notFound: {
    heading: "We couldn't find that course",
    body: "It may have been removed, or the link is out of date.",
  },
  error: {
    heading: "We couldn't load this course",
    body: "Check your connection, then try again.",
    retry: "Try again",
  },
} as const

type OverviewSearch = {
  preview?: OverviewPreviewName | undefined
}

// Public (#174): the `_catalog` layout never sends a visitor to /signin.
export const Route = createFileRoute("/_catalog/courses/$courseId")({
  validateSearch: (search: Record<string, unknown>): OverviewSearch => ({
    preview:
      import.meta.env.DEV && isOverviewPreviewName(search.preview)
        ? search.preview
        : undefined,
  }),
  // A preview is a fixed snapshot and never asks the API.
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ context, params, deps }) => {
    if (deps.preview !== undefined) return null
    return context.queryClient.ensureQueryData(
      catalogCourseQuery(params.courseId)
    )
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData === null || loaderData === undefined
            ? messages.fallbackTitle
            : messages.title.replace("{course}", loaderData.title),
      },
    ],
  }),
  component: Overview,
  pendingComponent: OverviewPending,
  errorComponent: OverviewError,
})

function Overview(): JSX.Element {
  const { preview } = Route.useSearch()
  const { courseId } = Route.useParams()
  if (import.meta.env.DEV && preview !== undefined) {
    const seeded = overviewPreviews[preview]
    const switcher = (
      <OverviewPreviewSwitcher courseId={courseId} current={preview} />
    )
    if (seeded.loading === true) return <OverviewPending switcher={switcher} />
    if (seeded.notFound === true || seeded.loadFailed === true) {
      return (
        <OverviewError
          error={
            new ApiError(
              seeded.notFound === true ? "NOT_FOUND" : "INTERNAL_ERROR",
              seeded.notFound === true ? 404 : 500
            )
          }
          reset={() => {}}
          switcher={switcher}
        />
      )
    }
    return (
      <OverviewPage switcher={switcher}>
        <CourseOverview
          course={seeded.course}
          actions={
            <OverviewActions
              courseId={seeded.course.courseId}
              added={seeded.course.added}
              viewer={seeded.viewer}
              outcome={seeded.outcome ?? null}
              pending={false}
              onStart={() => {}}
              onAdd={() => {}}
              onRemove={() => {}}
            />
          }
        />
      </OverviewPage>
    )
  }
  return <LiveOverview courseId={courseId} />
}

function LiveOverview({ courseId }: { courseId: string }): JSX.Element {
  const { data: course } = useSuspenseQuery(catalogCourseQuery(courseId))
  return (
    <OverviewPage>
      <CourseOverview
        course={course}
        actions={<LiveActions course={course} />}
      />
    </OverviewPage>
  )
}

/** Wires the buttons to the API. The overview's own data says what is added. */
function LiveActions({ course }: { course: CatalogCourseDetail }): JSX.Element {
  const signedIn = Boolean(useOptionalViewer())
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // The dashboard's counts, for what Continue opens. Only a learner's added course needs them.
  const { data: summaries } = useQuery({
    ...coursesQuery,
    enabled: signedIn && course.added,
  })

  const change = useMutation({
    mutationFn: ({ add }: { add: boolean; study: boolean }) =>
      setCourseAdded(course.courseId, add),
    onSuccess: async (enrollment, { study }) => {
      queryClient.setQueryData(
        catalogCourseQuery(course.courseId).queryKey,
        (old) => (old === undefined ? old : { ...old, added: enrollment.added })
      )
      if (study) {
        await navigate({
          to: "/study/$courseId",
          params: { courseId: course.courseId },
          search: { mode: "learn" },
        })
      }
      await Promise.all(
        [catalogQuery.queryKey, coursesQuery.queryKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      )
    },
  })

  const summary = summaries?.find((row) => row.courseId === course.courseId)
  const action = summary === undefined ? undefined : courseAction(summary)
  const viewer: OverviewViewer = signedIn
    ? {
        signedIn: true,
        next:
          action === undefined
            ? undefined
            : action && { mode: action.mode, count: action.count },
      }
    : { signedIn: false }

  let outcome: OverviewOutcome | null = null
  if (change.isError) outcome = "failed"
  else if (change.isSuccess && !change.variables.study) {
    outcome = change.data.added ? "added" : "removed"
  }

  return (
    <OverviewActions
      courseId={course.courseId}
      added={course.added}
      viewer={viewer}
      outcome={outcome}
      pending={change.isPending}
      onStart={() => {
        change.mutate({ add: true, study: true })
      }}
      onAdd={() => {
        change.mutate({ add: true, study: false })
      }}
      onRemove={() => {
        change.mutate({ add: false, study: false })
      }}
    />
  )
}

function OverviewPage({
  switcher,
  children,
}: {
  switcher?: JSX.Element
  children: JSX.Element
}): JSX.Element {
  return (
    <Section
      padding="compact"
      className={cn(catalogPageClass, "flex flex-col gap-6 pb-12 sm:gap-8")}
    >
      {switcher}
      {children}
    </Section>
  )
}

/** Shown only if the course takes more than a second to arrive. */
function OverviewPending({
  switcher,
}: {
  switcher?: JSX.Element
}): JSX.Element {
  return (
    <OverviewPage switcher={switcher}>
      <div
        role="status"
        className="flex items-center gap-3 text-muted-foreground"
      >
        <Spinner />
        <Text variant="muted">{messages.loading}</Text>
      </div>
    </OverviewPage>
  )
}

function OverviewError({
  error,
  reset,
  switcher,
}: ErrorComponentProps & { switcher?: JSX.Element }): JSX.Element {
  const router = useRouter()
  // A draft or an unknown id: no retry will help, so offer the catalog instead.
  const notFound = error instanceof ApiError && error.code === "NOT_FOUND"
  const copy = notFound ? messages.notFound : messages.error
  return (
    <OverviewPage switcher={switcher}>
      <div className="flex flex-col gap-4">
        <BackToCourses />
        <div
          role="alert"
          className="flex max-w-xl flex-col items-start gap-4 rounded-xl border border-border bg-card p-6"
        >
          <Heading level={1} size="3">
            {copy.heading}
          </Heading>
          <Text variant="muted">{copy.body}</Text>
          {notFound ? null : (
            <Button
              size="touch"
              onClick={() => {
                reset()
                void router.invalidate()
              }}
            >
              {messages.error.retry}
            </Button>
          )}
        </div>
      </div>
    </OverviewPage>
  )
}
