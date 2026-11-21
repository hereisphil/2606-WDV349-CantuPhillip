import type { JSX, ReactNode } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { createFormReducer } from "@workspace/core/form/form-reducer"
import { signUpSchema, TERMS_VERSION } from "@workspace/schemas/auth/sign-up"
import { Button } from "@workspace/ui/components/button"
import { signUp } from "@/lib/auth"
import { useFormatters } from "@/lib/formatters"
import {
  HOME_PATH,
  redirectViewer,
  safeReturnPath,
  startSession,
} from "@/lib/session"
import { AuthCard, authLinkClass } from "./-components/AuthCard"
import { AuthPreviewSwitcher } from "./-components/AuthPreviewSwitcher"
import { ConsentField } from "./-components/ConsentField"
import {
  isSignUpPreviewName,
  neverAnswers,
  previewState,
  signUpPreviews,
  type SignUpPreviewName,
} from "./-components/auth-previews"
import { FormField } from "./-components/FormField"
import { refusalMessage } from "./-components/auth-messages"
import { useAuthForm, validateWith } from "./-components/use-auth-form"

type AuthSearch = {
  /** Where to go once signed in: a path on this site, checked by `safeReturnPath`. */
  redirect?: string | undefined
  /** A development-only snapshot of the form (`auth-previews.ts`). */
  preview?: SignUpPreviewName | undefined
}

export const Route = createFileRoute("/_auth/signup")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeReturnPath(search.redirect),
    preview:
      import.meta.env.DEV && isSignUpPreviewName(search.preview)
        ? search.preview
        : undefined,
  }),
  // A preview opens even when signed in, so it can be checked any time.
  beforeLoad: (args) =>
    import.meta.env.DEV && args.search.preview !== undefined
      ? undefined
      : redirectViewer(args, args.search.redirect),
  component: SignUp,
})

const messages = {
  title: "Create your account",
  description: "Learn words with pictures and stories.",
  name: "Name",
  nameHint: "Shown next to the memory tips you share.",
  email: "Email address",
  password: "Password",
  passwordHint:
    "Use 8 or more characters. Include a capital letter, a lowercase letter and a symbol.",
  submit: "Create account",
  submitting: "Creating your account…",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  acceptTerms:
    "I am 13 or older, and I accept the <terms>Terms of Service</terms>.",
  privacy:
    "Read how we use your data in our <privacy>Privacy Policy</privacy>.",
} as const

type Field = "name" | "email" | "password" | "acceptedTermsVersion"

const inlineLinkClass =
  "font-semibold text-foreground underline underline-offset-4"

const reducer = createFormReducer<Field>(validateWith(signUpSchema))
// The box holds the Terms' version once ticked, so the form stays all strings.
const emptyForm = {
  name: "",
  email: "",
  password: "",
  acceptedTermsVersion: "",
}

const richTags = {
  terms: (chunk: string): ReactNode => (
    <Link to="/terms" target="_blank" className={inlineLinkClass}>
      {chunk}
    </Link>
  ),
  privacy: (chunk: string): ReactNode => (
    <Link to="/privacy" target="_blank" className={inlineLinkClass}>
      {chunk}
    </Link>
  ),
}

function SignUp(): JSX.Element {
  const { preview } = Route.useSearch()
  if (import.meta.env.DEV && preview !== undefined) {
    return (
      <div className="flex w-full max-w-md flex-col items-center">
        <AuthPreviewSwitcher
          previews={signUpPreviews}
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
        <SignUpForm key={preview} preview={preview} />
      </div>
    )
  }
  return <SignUpForm />
}

function SignUpForm({ preview }: { preview?: SignUpPreviewName }): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { rich } = useFormatters()
  const { redirect } = Route.useSearch()
  const seeded =
    import.meta.env.DEV && preview !== undefined
      ? signUpPreviews[preview]
      : undefined
  const { state, dispatch, submit } = useAuthForm(
    reducer,
    emptyForm,
    seeded === undefined ? signUp : neverAnswers,
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
    <AuthCard
      title={messages.title}
      description={messages.description}
      returnTo={redirect}
    >
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <FormField
          id="name"
          label={messages.name}
          type="text"
          autoComplete="name"
          value={state.fields.name}
          onChange={(value) => {
            dispatch({ type: "FIELD_CHANGED", field: "name", value })
          }}
          hint={messages.nameHint}
          errors={fieldErrors.name}
          disabled={busy}
        />
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
          autoComplete="new-password"
          value={state.fields.password}
          onChange={(value) => {
            dispatch({ type: "FIELD_CHANGED", field: "password", value })
          }}
          hint={messages.passwordHint}
          errors={fieldErrors.password}
          disabled={busy}
        />
        <ConsentField
          id="acceptedTermsVersion"
          checked={state.fields.acceptedTermsVersion === TERMS_VERSION}
          onChange={(checked) => {
            dispatch({
              type: "FIELD_CHANGED",
              field: "acceptedTermsVersion",
              value: checked ? TERMS_VERSION : "",
            })
          }}
          errors={fieldErrors.acceptedTermsVersion}
          disabled={busy}
        >
          {rich(messages.acceptTerms, richTags)}
        </ConsentField>

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

      {/* Links inside a sentence stay inline: only the page switch is a target. */}
      <p className="mt-4 text-center text-base text-muted-foreground">
        {rich(messages.privacy, richTags)}
      </p>

      <p className="mt-2 text-center text-base text-muted-foreground">
        {messages.haveAccount}{" "}
        <Link to="/signin" search={{ redirect }} className={authLinkClass}>
          {messages.signIn}
        </Link>
      </p>
    </AuthCard>
  )
}
