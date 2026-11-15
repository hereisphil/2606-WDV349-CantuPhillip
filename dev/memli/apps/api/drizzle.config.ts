import { defineConfig } from "drizzle-kit"

// drizzle-kit only writes SQL migration files from src/db/schema.ts; it never
// connects to a database. Wrangler applies them to D1 (`bun run db:migrate`).
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
})
