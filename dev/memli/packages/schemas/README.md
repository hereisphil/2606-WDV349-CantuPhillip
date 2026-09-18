# `@workspace/schemas`

Shared [Zod](https://zod.dev/) schemas for Memli — the FE/BE contract layer.

Use this package for validation at API boundaries, forms, and env parsing. **Do not** put Zod in `@workspace/ui`.

## Exports

| Import | Use for |
|--------|---------|
| `@workspace/schemas/auth/sign-in` | Sign-in form input |
| `@workspace/schemas/env/web` | Vite `import.meta.env` validation |

## Usage

```ts
import { signInSchema } from "@workspace/schemas/auth/sign-in"

const result = signInSchema.safeParse({ email, password })
```

## Later

- Domain models (Users, Courses, Flashcards, SRS) when Drizzle + Hono land
- Prefer `drizzle-zod` to derive schemas from tables instead of hand-duplicating
