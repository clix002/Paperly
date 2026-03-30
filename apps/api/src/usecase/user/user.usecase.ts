import { user as userTable } from "@paperly/db"
import { eq } from "drizzle-orm"
import { GraphQLError } from "graphql"
import type { IContext } from "../../graphql/context"

class UserUseCase {
  async getMe(ctx: IContext) {
    if (!ctx.user) return null
    const [dbUser] = await ctx.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, ctx.user.id))
      .limit(1)
    return dbUser ?? null
  }

  async getUsers(ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", {
        extensions: { code: "UNAUTHORIZED" },
      })
    }
    return ctx.db.select().from(userTable)
  }

  async saveUserSignature(args: { dataUrl: string }, ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    const [updated] = await ctx.db
      .update(userTable)
      .set({ signatureUrl: args.dataUrl })
      .where(eq(userTable.id, ctx.user.id))
      .returning()

    if (!updated) {
      throw new GraphQLError("Usuario no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    return updated
  }
}

const userUseCase = new UserUseCase()
export default userUseCase
