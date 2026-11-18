import { useReducer, type Dispatch, type SubmitEvent } from "react"
import {
  startForm,
  type FieldErrors,
  type FormEvent,
  type FormState,
} from "@workspace/core/form/form-reducer"
import type { AuthResult } from "@/lib/auth"

type Reducer<Field extends string> = (
  state: FormState<Field>,
  event: FormEvent<Field>
) => FormState<Field>

/** The part of a Zod schema this file uses. */
type Schema = {
  safeParse: (value: unknown) =>
    | { success: true }
    | {
        success: false
        error: {
          issues: readonly { path: readonly PropertyKey[]; message: string }[]
        }
      }
}

/** A schema's verdict as the form reducer wants it: messages by field. */
export function validateWith<Field extends string>(
  schema: Schema
): (fields: Readonly<Record<Field, string>>) => FieldErrors<Field> | null {
  return (fields) => {
    const result = schema.safeParse(fields)
    if (result.success) return null

    const errors: Partial<Record<string, string[]>> = {}
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      errors[field] = [...(errors[field] ?? []), issue.message]
    }
    return errors as FieldErrors<Field>
  }
}

type AuthForm<Field extends string> = {
  state: FormState<Field>
  dispatch: Dispatch<FormEvent<Field>>
  /** The form's `onSubmit`. Validates, sends, and reports how it went. */
  submit: (event: SubmitEvent<HTMLFormElement>) => void
}

/**
 * One auth form: the reducer from `@workspace/core`, plus the request.
 * `onSuccess` runs once the server has set the session cookie.
 */
export function useAuthForm<Field extends string>(
  reducer: Reducer<Field>,
  initial: Readonly<Record<Field, string>>,
  send: (fields: Readonly<Record<Field, string>>) => Promise<AuthResult>,
  onSuccess: () => void
): AuthForm<Field> {
  const [state, dispatch] = useReducer(reducer, initial, startForm)

  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    // The pure reducer says what this submit does, so the request starts
    // here in the handler, never in an effect that watches `status`.
    const next = reducer(state, { type: "SUBMITTED" })
    dispatch({ type: "SUBMITTED" })

    if (next.status === "idle") {
      const [firstInvalid] = Object.keys(next.fieldErrors)
      if (firstInvalid !== undefined) {
        document.getElementById(firstInvalid)?.focus()
      }
    }
    // The same state back means a request is already out.
    if (next === state || next.status !== "submitting") return

    void send(next.fields).then((result) => {
      if (result.ok) {
        dispatch({ type: "SUBMIT_SUCCEEDED" })
        onSuccess()
      } else {
        dispatch({ type: "SUBMIT_FAILED", code: result.code })
      }
    })
  }

  return { state, dispatch, submit }
}
