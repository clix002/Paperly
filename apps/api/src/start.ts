import { execSync } from "node:child_process"

// Correr migraciones antes de iniciar la API
console.log("⏳ Aplicando migraciones...")
execSync("cd /app/packages/db && bun run db:push", { stdio: "inherit" })
console.log("✅ Migraciones listas")

// Iniciar la API
await import("./index")
