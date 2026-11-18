// A form that is sent to a server, as a state machine (docs/state-management.md).
// Any other status × event pair is a no-op. No copy lives here, only codes.

/** One list of messages per field that failed. A field with none is absent. */
export type FieldErrors<Field extends string> = Partial<
  Record<Field, readonly string[]>
>

type Fields<Field extends string> = Readonly<Record<Field, string>>

export type FormState<Field extends string> =
  /** Being filled in. `fieldErrors` is what the last submit got wrong. */
  | {
      readonly status: "idle"
      readonly fields: Fields<Field>
      readonly fieldErrors: FieldErrors<Field>
    }
  /** Valid and on its way. The app sends `fields` now. */
  | { readonly status: "submitting"; readonly fields: Fields<Field> }
  /** The server refused. `code` is its stable code; the app maps it to copy. */
  | {
      readonly status: "error"
      readonly fields: Fields<Field>
      readonly code: string
    }
  | { readonly status: "success"; readonly fields: Fields<Field> }

export type FormEvent<Field extends string> =
  | {
      readonly type: "FIELD_CHANGED"
      readonly field: Field
      readonly value: string
    }
  | { readonly type: "SUBMITTED" }
  | { readonly type: "SUBMIT_SUCCEEDED" }
  | { readonly type: "SUBMIT_FAILED"; readonly code: string }

/** Checks every field at once. `null` means the form can be sent. */
export type Validate<Field extends string> = (
  fields: Fields<Field>
) => FieldErrors<Field> | null

export function startForm<Field extends string>(
  fields: Fields<Field>
): FormState<Field> {
  return { status: "idle", fields, fieldErrors: {} }
}

/** The errors of every field but `field`. */
function withoutField<Field extends string>(
  errors: FieldErrors<Field>,
  field: Field
): FieldErrors<Field> {
  const rest = { ...errors }
  delete rest[field]
  return rest
}

/**
 * A reducer for one form. `validate` comes from the app, so the schema and
 * its messages stay out of this package.
 */
export function createFormReducer<Field extends string>(
  validate: Validate<Field>
): (state: FormState<Field>, event: FormEvent<Field>) => FormState<Field> {
  return (state, event) => {
    // Nothing changes while a request is out, or once it has succeeded.
    if (state.status === "submitting") {
      switch (event.type) {
        case "SUBMIT_SUCCEEDED":
          return { status: "success", fields: state.fields }
        case "SUBMIT_FAILED":
          return { status: "error", fields: state.fields, code: event.code }
        default:
          return state
      }
    }
    if (state.status === "success") return state

    switch (event.type) {
      case "FIELD_CHANGED":
        return {
          status: "idle",
          fields: { ...state.fields, [event.field]: event.value },
          // Typing clears that field's errors, and the server's refusal.
          fieldErrors:
            state.status === "idle"
              ? withoutField(state.fieldErrors, event.field)
              : {},
        }
      case "SUBMITTED": {
        const fieldErrors = validate(state.fields)
        return fieldErrors === null
          ? { status: "submitting", fields: state.fields }
          : { status: "idle", fields: state.fields, fieldErrors }
      }
      default:
        return state
    }
  }
}
