import { createFileRoute, Link } from "@tanstack/react-router"
import { BookOpen } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export const Route = createFileRoute("/_auth/signin")({
  component: SignIn,
})

const inputClass =
  "h-11 w-full rounded-lg border border-input bg-secondary px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function SignIn() {
  return (
    <div className="w-full max-w-md">
      <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2 font-semibold text-primary">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg">Mnemno</span>
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Master your vocabulary with visual memory.
        </p>

        <Button variant="outline" className="mt-6 h-11 w-full">
          <GoogleIcon />
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            OR USE EMAIL ADDRESS
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold tracking-wide"
            >
              EMAIL ADDRESS
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold tracking-wide"
              >
                PASSWORD
              </label>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <Button type="submit" className="mt-2 h-11 w-full">
            Sign In / Sign Up
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}
