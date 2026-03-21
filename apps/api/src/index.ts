import { Hono } from "hono"
import { cors } from "hono/cors"
import { authRoutes } from "./auth/auth.routes"
import { yoga } from "./graphql/yoga"
import { env } from "./lib/env"
import { getFromR2, uploadToR2 } from "./lib/r2"

const app = new Hono()

// CORS — must be before all routes
app.use(
  "/*",
  cors({
    origin: env.WEB_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

// Auth routes (Better Auth handles all /auth/**)
app.route("/auth", authRoutes)

// Upload endpoint
app.post("/upload", async (c) => {
  const body = await c.req.parseBody()
  const file = body.file

  if (!file || typeof file === "string") {
    return c.json({ error: "No file provided" }, 400)
  }

  const ext = file.name.split(".").pop() ?? "bin"
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = await file.arrayBuffer()

  const url = await uploadToR2(buffer, filename, file.type)
  return c.json({ url })
})

// Serve uploads via proxy from R2
app.get("/uploads/:key", async (c) => {
  const key = c.req.param("key")
  const obj = await getFromR2(key)
  const body = obj.Body as ReadableStream
  return new Response(body, {
    headers: {
      "Content-Type": obj.ContentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
})

// GraphQL (Yoga handles GET + POST)
app.on(["GET", "POST"], "/graphql", (c) => yoga.fetch(c.req.raw, { env }))

Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
})

console.log(`🚀 API running at http://localhost:${env.PORT}`)
