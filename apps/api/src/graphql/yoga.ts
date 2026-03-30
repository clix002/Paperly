import { createYoga } from "graphql-yoga"
import { auth } from "../auth/auth"
import { createContext } from "./context"
import { schema } from "./schema"

export const yoga = createYoga({
  schema,
  context: ({ request }) => createContext(request, auth),
  graphiql: process.env.NODE_ENV === "development",
  cors: false, // CORS is handled by Hono
})
