import type { DB } from "@paperly/db"
import { db } from "@paperly/db"
import type { auth } from "../auth/auth"
import { type DataLoaders, getDataLoaders } from "./dataloaders"

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>
export type User = NonNullable<Session>["user"]

export interface IContext {
  db: DB
  user: User | null
  session: Session | null
  request: Request
  dataLoaders: DataLoaders
}

export async function createContext(
  request: Request,
  authInstance: typeof auth
): Promise<IContext> {
  const session = await authInstance.api.getSession({
    headers: request.headers,
  })

  const ctx: IContext = {
    db,
    user: session?.user ?? null,
    session,
    request,
    dataLoaders: {} as DataLoaders,
  }

  // DataLoaders necesitan el contexto para acceder a db
  ctx.dataLoaders = getDataLoaders(ctx)

  return ctx
}
