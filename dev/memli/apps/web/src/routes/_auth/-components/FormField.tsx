import type { JSX } from "react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

/**
 * One labelled input with its hint and errors. `id` is the field's name, so
 * a failed submit can move focus to the first field that needs fixing.
 */
export function FormField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  hint,
  errors = [],
  disabled,
}: {
  id: string
  label: string
  type: "text" | "email" | "password"
  autoComplete: string
  value: string
  onChange: (value: string) => void
  /** Always shown under the input, such as the password rules. */
  hint?: string
  errors?: readonly string[] | undefined
  disabled: boolean
}): JSX.Element {
  const hintId = hint === undefined ? undefined : `${id}-hint`
  const errorId = errors.length === 0 ? undefined : `${id}-error`
  const describedBy = [hintId, errorId].filter(Boolean).join(" ")

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="h-11 bg-secondary"
        disabled={disabled}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        aria-invalid={errors.length > 0 ? true : undefined}
        aria-describedby={describedBy === "" ? undefined : describedBy}
      />
      {hint === undefined ? null : (
        <p id={hintId} className="text-base text-muted-foreground">
          {hint}
        </p>
      )}
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
