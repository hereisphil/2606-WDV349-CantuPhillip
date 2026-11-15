import { describe, expect, it } from "vitest"

/**
 * Guards docs/i18n.md across every contract in this package: a language is
 * never one unqualified `language` field, and every field that holds one
 * takes a canonical language tag.
 *
 * It walks every exported schema, so a new file or field is covered without
 * anyone remembering to add it here.
 */

// Vite (which runs Vitest) replaces this call with the modules it matches.
declare global {
  interface ImportMeta {
    glob: (
      patterns: string[],
      options: { eager: true }
    ) => Record<string, Record<string, unknown>>
  }
}

const modules = import.meta.glob(["../**/*.ts", "!../**/*.test.ts"], {
  eager: true,
})

/** Field names that say "a language" without saying which one. */
const UNQUALIFIED = new Set(["language", "lang", "locale"])

/** Field names that hold a language: `learningLanguage`, `uiLocale`… */
const LANGUAGE_FIELD = /(Language|Locale)$/

type ZodLike = {
  _zod: { def: Record<string, unknown> & { type: string } }
  safeParse: (value: unknown) => { success: boolean }
}

function isZod(value: unknown): value is ZodLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "_zod" in value &&
    "safeParse" in value
  )
}

type Field = { path: string; key: string; schema: ZodLike }

/** Every object field inside a schema, however deeply nested. */
function fieldsOf(
  schema: ZodLike,
  path: string,
  seen = new Set<unknown>()
): Field[] {
  if (seen.has(schema)) return []
  seen.add(schema)
  const def = schema._zod.def
  const children: [string, unknown][] = []

  switch (def.type) {
    case "object":
      for (const [key, child] of Object.entries(
        def.shape as Record<string, unknown>
      )) {
        children.push([`${path}.${key}`, child])
      }
      break
    case "array":
      children.push([`${path}[]`, def.element])
      break
    case "union":
      for (const option of def.options as unknown[]) {
        children.push([path, option])
      }
      break
    case "pipe":
      children.push([path, def.in], [path, def.out])
      break
    default:
      // optional, nullable, default, readonly and the like wrap one schema.
      if ("innerType" in def) children.push([path, def.innerType])
  }

  return children.flatMap(([childPath, child]) => {
    if (!isZod(child)) return []
    const key = childPath.split(".").at(-1) ?? ""
    const own =
      def.type === "object" ? [{ path: childPath, key, schema: child }] : []
    return [...own, ...fieldsOf(child, childPath, seen)]
  })
}

const fields = Object.entries(modules).flatMap(([file, exports]) =>
  Object.entries(exports).flatMap(([name, value]) =>
    isZod(value) ? fieldsOf(value, `${file.replace("../", "")}:${name}`) : []
  )
)

describe("language fields across @workspace/schemas", () => {
  it("finds the contracts to check", () => {
    // If the walk breaks, the tests below would pass on nothing.
    const keys = new Set(fields.map((field) => field.key))
    for (const known of [
      "learningLanguage",
      "answerLanguage",
      "contentLocale",
    ]) {
      expect(keys).toContain(known)
    }
  })

  it("never has a field that just says language", () => {
    expect(
      fields.filter((field) => UNQUALIFIED.has(field.key)).map((f) => f.path)
    ).toEqual([])
  })

  it("takes a canonical language tag in every language field", () => {
    const loose = fields
      .filter((field) => LANGUAGE_FIELD.test(field.key))
      .filter(
        ({ schema }) =>
          !schema.safeParse("pt-BR").success ||
          schema.safeParse("English").success ||
          schema.safeParse("pt-br").success
      )
      .map((field) => field.path)

    expect(loose).toEqual([])
  })
})
