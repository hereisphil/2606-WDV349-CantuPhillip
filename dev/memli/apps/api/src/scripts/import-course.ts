/// <reference types="node" />
/* eslint-disable no-console -- a command-line tool: the terminal is its output */
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { courseFileSchema } from "@workspace/schemas/content/course-file"

import {
  importChecks,
  importStatements,
  planImport,
  type CheckRow,
} from "../import/course-import"

/**
 * `bun run db:import-course <file> [--target local|staging] [--yes]
 * [--remove-missing]`. See apps/api/README.md, "Importing a course".
 */

const apiDir = resolve(import.meta.dirname, "../..")

/** Each target's database, as `wrangler d1 execute` names it. */
const targets = {
  local: ["memli", "--local"],
  staging: ["memli-staging", "--env", "staging", "--remote"],
} as const
type Target = keyof typeof targets

const usage = `Usage: bun run db:import-course <course.json> [--target local|staging] [--yes] [--remove-missing]

  --target          Where to import: local (the default) or staging.
  --yes             Needed to change staging. Without it, you see what would change.
  --remove-missing  Delete words the file no longer has, and everyone's progress on them.`

function fail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

function parseArgs(argv: readonly string[]): {
  file: string
  target: Target
  yes: boolean
  removeMissing: boolean
} {
  const files = argv.filter((arg) => !arg.startsWith("--"))
  const flags = argv.filter((arg) => arg.startsWith("--"))
  let target: string = "local"
  const targetIndex = argv.indexOf("--target")
  if (targetIndex !== -1) target = argv[targetIndex + 1] ?? ""
  const file = files.filter((arg) => arg !== target)[0]

  if (argv.includes("--help") || file === undefined) fail(usage)
  if (target === "production") {
    fail(
      "Production has no database yet. #114 creates it; then add it to `targets` in src/scripts/import-course.ts."
    )
  }
  if (!(target in targets)) fail(`Unknown target "${target}".\n\n${usage}`)
  const known = ["--target", "--yes", "--remove-missing", "--help"]
  const unknown = flags.filter((flag) => !known.includes(flag))
  if (unknown.length > 0)
    fail(`Unknown option ${unknown.join(", ")}.\n\n${usage}`)

  return {
    file,
    target: target as Target,
    yes: argv.includes("--yes"),
    removeMissing: argv.includes("--remove-missing"),
  }
}

/** Runs `wrangler d1 execute` against the target, from apps/api. */
function wrangler(target: Target, args: readonly string[]): string {
  const result = spawnSync(
    "bunx",
    ["wrangler", "d1", "execute", ...targets[target], ...args],
    // Captured, and shown only when it fails: a success prints one line per statement.
    { cwd: apiDir, encoding: "utf8", stdio: "pipe" }
  )
  if (result.status !== 0) {
    fail(`wrangler failed:\n${result.stderr}${result.stdout}`)
  }
  return result.stdout
}

const options = parseArgs(process.argv.slice(2))

// 1. Read and check the file.
let raw: unknown
try {
  raw = JSON.parse(readFileSync(resolve(options.file), "utf8"))
} catch (error) {
  fail(`Couldn't read ${options.file} as JSON: ${String(error)}`)
}
const parsed = courseFileSchema.safeParse(raw)
if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".") || "(file)"}: ${issue.message}`)
    .join("\n")
  fail(
    `${options.file} isn't a valid course file:\n${problems}\n\nFormat: dev/memli/docs/course-files.md`
  )
}
const file = parsed.data

// 2. Ask the database what the import would change.
const answer = wrangler(options.target, [
  "--json",
  "--command",
  importChecks(file).join(";\n"),
])
const rows = (JSON.parse(answer) as { results: CheckRow[] }[]).flatMap(
  (result) => result.results
)
const plan = planImport(file, rows)

if (plan.takenCardIds.length > 0 || plan.takenMnemonicIds.length > 0) {
  fail(
    [
      "These ids already belong to another course or a learner. Rename them in the file:",
      ...plan.takenCardIds.map((id) => `  card ${id}`),
      ...plan.takenMnemonicIds.map((id) => `  mnemonic ${id}`),
    ].join("\n")
  )
}
if (plan.removedCards.length > 0 && !options.removeMissing) {
  fail(
    [
      `The file no longer has ${String(plan.removedCards.length)} word(s) this course has now:`,
      ...plan.removedCards.map((id) => `  ${id}`),
      "",
      "Importing would delete them and every learner's progress on them.",
      "Put them back in the file, or run again with --remove-missing.",
    ].join("\n")
  )
}

const mnemonicCount = file.cards.reduce(
  (sum, card) => sum + (card.mnemonics?.length ?? 0),
  0
)
console.log(
  [
    "",
    `Course:   ${file.course.title} (${file.course.courseId})`,
    `Target:   ${options.target}`,
    `Words:    ${String(file.cards.length)}, with ${String(mnemonicCount)} starter mnemonic(s)`,
    `Catalog:  ${file.course.published ? "published" : "hidden draft"}`,
    plan.removedCards.length > 0
      ? `Removing: ${String(plan.removedCards.length)} word(s), and their progress`
      : "Removing: nothing",
    "",
  ].join("\n")
)

if (options.target !== "local" && !options.yes) {
  fail(
    `Nothing changed. Run again with --yes to import into ${options.target}.`
  )
}

// 3. Import, as one SQL file.
const statements = importStatements(file, {
  now: new Date(),
  removeMissing: options.removeMissing,
})
const dir = mkdtempSync(join(tmpdir(), "memli-import-"))
const sqlPath = join(dir, `${file.course.courseId}.sql`)
try {
  writeFileSync(sqlPath, `${statements.join(";\n")};\n`)
  wrangler(options.target, ["--yes", "--file", sqlPath])
} finally {
  rmSync(dir, { recursive: true, force: true })
}
console.log(`\nImported ${file.course.title} into ${options.target}.\n`)
