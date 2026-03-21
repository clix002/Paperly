import { nextCookies } from "better-auth/next-js"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [nextCookies()],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
