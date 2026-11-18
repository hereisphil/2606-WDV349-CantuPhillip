import type { JSX } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { createFormReducer } from "@workspace/core/form/form-reducer"
import { signInSchema } from "@workspace/schemas/auth/sign-in"
import { Button } from "@workspace/ui/components/button"
import { signIn } from "@/lib/auth"
import {
  HOME_PATH,
  redirectViewer,
  safeReturnPath,
  startSession,
} from "@/lib/session"
import { AuthCard, authLinkClass } from "./-components/AuthCard"
import { AuthPreviewSwitcher } from "./-components/AuthPreviewSwitcher"
import {
  isSignInPreviewName,
  neverAnswers,
  previewState,
  signInPreviews,
  type SignInPreviewName,
} from "./-components/auth-previews"
import { FormField } from "./-components/FormField"
import { refusalMessage } from "./-components/auth-messages"
import { useAuthForm, validateWith } from "./-components/use-auth-form"

type AuthSearch = {
  /** Where to go once signed in: a path on this site, checked by `safeReturnPath`. */
  redirect?: string | undefined
  /** A development-only snapshot of the form (`auth-previews.ts`). */
  preview?: SignInPreviewName | undefined
}

export const Route = createFileRoute("/_auth/signin")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeReturnPath(search.redirect),
    preview:
      import.meta.env.DEV && isSignInPreviewName(search.preview)
        ? search.preview
        : undefined,
  }),
  // A preview opens even when signed in, so it can be checked any time.
  beforeLoad: (args) =>
    import.meta.env.DEV && args.search.preview !== undefined
      ? undefined
      : redirectViewer(args, args.search.redirect),
  component: SignIn,
})

const messages = {
  title: "Welcome!",
  description: "Master your vocabulary with visual memory.",
  email: "Email address",
  password: "Password",
  submit: "Sign in",
  submitting: "Signing in…",
  noAccount: "New to Memli?",
  createAccount: "Create an account",
} as const

type Field = "email" | "password"

const reducer = createFormReducer<Field>(validateWith(signInSchema))
const emptyForm = { email: "", password: "" }

function SignIn(): JSX.Element {
  const { preview } = Route.useSearch()
  if (import.meta.env.DEV && preview !== undefined) {
    return (
      <div className="flex w-full max-w-md flex-col items-center">
        <AuthPreviewSwitcher
          previews={signInPreviews}
          current={preview}
          renderLink={(name, props) => (
            <Link
              from={Route.fullPath}
              to="."
              search={(search) => ({ ...search, preview: name })}
              {...props}
            />
          )}
        />
        {/* Keyed, so switching previews starts the form over. */}
        <SignInForm key={preview} preview={preview} />
      </div>
    )
  }
  return <SignInForm />
}

function SignInForm({ preview }: { preview?: SignInPreviewName }): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()
  const seeded =
    import.meta.env.DEV && preview !== undefined
      ? signInPreviews[preview]
      : undefined
  const { state, dispatch, submit } = useAuthForm(
    reducer,
    emptyForm,
    seeded === undefined ? signIn : neverAnswers,
    async () => {
      await startSession(queryClient)
      await navigate({ href: redirect ?? HOME_PATH, replace: true })
    },
    seeded === undefined ? undefined : previewState(reducer, emptyForm, seeded)
  )

  // The fields stay locked after success, while the dashboard loads.
  const busy = state.status === "submitting" || state.status === "success"
  const fieldErrors = state.status === "idle" ? state.fieldErrors : {}

  return (
    <AuthCard title={messages.title} description={messages.description}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <FormField
          id="email"
          label={messages.email}
          type="email"
          autoComplete="email"
          value={state.fields.email}
          onChange={(value) => {
            dispatch({ type: "FIELD_CHANGED", field: "email", value })
          }}
          errors={fieldErrors.email}
          disabled={busy}
        />
        <FormField
          id="password"
          label={messages.password}
          type="password"
          autoComplete="current-password"
          value={state.fields.password}
          onChange={(value) => {
            dispatch({ type: "FIELD_CHANGED", field: "password", value })
          }}
          errors={fieldErrors.password}
          disabled={busy}
        />

        {state.status === "error" ? (
          <p role="alert" className="text-base text-destructive">
            {refusalMessage(state.code)}
          </p>
        ) : null}

        <Button
          type="submit"
          size="touch"
          className="mt-2 w-full"
          disabled={busy}
        >
          {busy ? messages.submitting : messages.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-base text-muted-foreground">
        {messages.noAccount}{" "}
        <Link to="/signup" search={{ redirect }} className={authLinkClass}>
          {messages.createAccount}
        </Link>
      </p>
    </AuthCard>
  )
}
