import { Hono } from "hono"
import { cors } from "hono/cors"
import { authRoutes } from "./auth/auth.routes"
import { yoga } from "./graphql/yoga"
import { env } from "./lib/env"

const app = new Hono()

// CORS — must be before all routes
app.use(
  "/*",
  cors({
    origin: env.FRONTEND_URL,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))

// Auth routes (Better Auth handles all /auth/**)
app.route("/auth", authRoutes)

// GraphQL (Yoga handles GET + POST)
app.on(["GET", "POST"], "/graphql", (c) => yoga.fetch(c.req.raw, { env }))

console.log(`🚀 API running at http://localhost:${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
