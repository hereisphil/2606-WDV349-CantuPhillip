import type { JSX, ReactNode } from "react"

/**
 * A box the learner must tick, with its errors. The whole row is the label,
 * so it is a 44 px target although the box itself is smaller.
 */
export function ConsentField({
  id,
  checked,
  onChange,
  children,
  errors = [],
  disabled,
}: {
  /** The field's name, so a failed submit can move focus here. */
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** The label. It may hold links, such as one to the Terms. */
  children: ReactNode
  errors?: readonly string[] | undefined
  disabled: boolean
}): JSX.Element {
  const errorId = errors.length === 0 ? undefined : `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-base text-foreground has-disabled:cursor-not-allowed"
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.checked)
          }}
          aria-invalid={errors.length > 0 ? true : undefined}
          aria-describedby={errorId}
        />
        <span>{children}</span>
      </label>
      {errors.length === 0 ? null : (
        <ul id={errorId} className="flex flex-col gap-0.5">
          {errors.map((error) => (
            <li key={error} className="text-base text-destructive">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
