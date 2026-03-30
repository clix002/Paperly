import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

function loadGraphqlFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      results.push(...loadGraphqlFiles(fullPath))
    } else if (entry.endsWith(".graphql")) {
      results.push(readFileSync(fullPath, "utf-8"))
    }
  }
  return results
}

export const typeDefs = loadGraphqlFiles(import.meta.dir).join("\n")
