import type { JSX } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { createFormReducer } from "@workspace/core/form/form-reducer"
import { signUpSchema } from "@workspace/schemas/auth/sign-up"
import { Button } from "@workspace/ui/components/button"
import { signUp } from "@/lib/auth"
import {
  HOME_PATH,
  redirectViewer,
  safeReturnPath,
  startSession,
} from "@/lib/session"
import { AuthCard, authLinkClass } from "./-components/AuthCard"
import { FormField } from "./-components/FormField"
import { refusalMessage } from "./-components/auth-messages"
import { useAuthForm, validateWith } from "./-components/use-auth-form"

type AuthSearch = {
  /** Where to go once signed in: a path on this site, checked by `safeReturnPath`. */
  redirect?: string | undefined
}

export const Route = createFileRoute("/_auth/signup")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: safeReturnPath(search.redirect),
  }),
  beforeLoad: (args) => redirectViewer(args, args.search.redirect),
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
  termsBefore: "Creating an account means you accept our",
  terms: "Terms of Service",
  termsJoin: "and",
  privacy: "Privacy Policy",
} as const

type Field = "name" | "email" | "password"

const inlineLinkClass =
  "font-semibold text-foreground underline underline-offset-4"

const reducer = createFormReducer<Field>(validateWith(signUpSchema))
const emptyForm = { name: "", email: "", password: "" }

function SignUp(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect } = Route.useSearch()
  const { state, dispatch, submit } = useAuthForm(
    reducer,
    emptyForm,
    signUp,
    async () => {
      await startSession(queryClient)
      await navigate({ href: redirect ?? HOME_PATH, replace: true })
    }
  )

  // The fields stay locked after success, while the dashboard loads.
  const busy = state.status === "submitting" || state.status === "success"
  const fieldErrors = state.status === "idle" ? state.fieldErrors : {}

  return (
    <AuthCard title={messages.title} description={messages.description}>
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
        {messages.termsBefore}{" "}
        <Link to="/terms" className={inlineLinkClass}>
          {messages.terms}
        </Link>{" "}
        {messages.termsJoin}{" "}
        <Link to="/privacy" className={inlineLinkClass}>
          {messages.privacy}
        </Link>
        .
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
