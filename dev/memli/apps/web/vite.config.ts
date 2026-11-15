import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

// `apps/api` (Hono on a local Cloudflare Worker) listens here in dev. The port
// is pinned in apps/api/wrangler.jsonc.
const API_ORIGIN = "http://localhost:8787"

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // The browser only ever talks to this origin. Vite forwards /api/* to the
    // API, so there is no CORS to configure and cookies stay first-party.
    proxy: {
      "/api": API_ORIGIN,
    },
  },
})
