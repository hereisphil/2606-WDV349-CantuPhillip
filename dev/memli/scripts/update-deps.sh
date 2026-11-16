#!/usr/bin/env bash
# Moves every dependency to the newest release its package.json range allows,
# changing only bun.lock. Prints a Markdown list of the direct bumps. (#148)
set -euo pipefail

cd "$(dirname "$0")/.."

manifests=(package.json apps/*/package.json packages/*/package.json)
if ! git diff --quiet HEAD -- "${manifests[@]}" bun.lock; then
  echo "Commit or stash package.json and bun.lock changes first." >&2
  exit 1
fi

log=$(mktemp)
trap 'rm -f "$log"' EXIT

# `bun update` only touches the workspace it runs in, so visit each one.
for dir in . apps/* packages/*; do
  [ -f "$dir/package.json" ] || continue
  echo "Updating $dir" >&2
  (cd "$dir" && bun update) >>"$log" 2>&1 || {
    cat "$log" >&2
    exit 1
  }
done

# bunfig's `exact = true` makes `bun update` rewrite ranges as exact pins.
# Put the ranges back; the lockfile keeps the new versions they allow.
git checkout -- "${manifests[@]}"
bun install >&2

# Compare lockfiles: `bun update` doesn't print every bump (zod, for one).
names=$(node -e '
  const fs = require("fs"), names = new Set()
  for (const file of process.argv.slice(1)) {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"))
    for (const field of ["dependencies", "devDependencies"])
      for (const [name, range] of Object.entries(pkg[field] ?? {}))
        if (!range.startsWith("workspace:")) names.add(name)
  }
  console.log([...names].sort().join("\n"))
' "${manifests[@]}")

# Hoisted entries look like:     "zod": ["zod@4.6.7", "", ...
locked() {
  { grep -m1 -F "    \"$1\": [\"$1@" || true; } | sed -E 's/^[^[]*\["//; s/".*//; s/.*@//'
}

before=$(git show HEAD:./bun.lock)
while IFS= read -r name; do
  old=$(locked "$name" <<<"$before")
  new=$(locked "$name" <bun.lock)
  [ "$old" = "$new" ] || echo "- \`$name\` $old → $new"
done <<<"$names"
