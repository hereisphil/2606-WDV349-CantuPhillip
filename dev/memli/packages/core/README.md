# @workspace/core

Pure domain logic for Memli — no React, no I/O. The SRS engine and other algorithms live here so they can be unit-tested in isolation and reused from the API Worker later.

## Testing

```bash
cd dev/memli
bun run test
```

Vitest runs only in this package for now. We intentionally **do not** test marketing routes or shadcn components here; UI coverage can wait until study flows exist.

### What we test

- **SRS scheduling** (`src/srs/`) — interval, ease factor, and repetition updates (SM-2, binary pass/fail grades).

### What we skip (for now)

- React components and TanStack Router pages
- Drizzle models / D1 persistence
- API route handlers (add Worker tests when `apps/api` lands)

## Exports

| Path | Purpose |
|------|---------|
| `@workspace/core/srs/grade-card` | SM-2 card grading for a single review event |
