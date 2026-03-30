import { notification as notificationTable } from "@paperly/db"
import { and, count, desc, eq } from "drizzle-orm"
import { GraphQLError } from "graphql"
import type { IContext } from "../../graphql/context"

interface CreateNotificationParams {
  type: string
  title: string
  message?: string
  userId: string
  documentId?: string
}

class NotificationUseCase {
  async getMyNotifications(ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    return ctx.db
      .select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, ctx.user.id))
      .orderBy(desc(notificationTable.createdAt))
      .limit(50)
  }

  async getUnreadCount(ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    const [result] = await ctx.db
      .select({ total: count() })
      .from(notificationTable)
      .where(and(eq(notificationTable.userId, ctx.user.id), eq(notificationTable.isRead, false)))

    return result?.total ?? 0
  }

  async markRead(args: { id: string }, ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    const [updated] = await ctx.db
      .update(notificationTable)
      .set({ isRead: true })
      .where(and(eq(notificationTable.id, args.id), eq(notificationTable.userId, ctx.user.id)))
      .returning()

    if (!updated) {
      throw new GraphQLError("Notificación no encontrada", { extensions: { code: "NOT_FOUND" } })
    }

    return updated
  }

  async markAllRead(ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    await ctx.db
      .update(notificationTable)
      .set({ isRead: true })
      .where(and(eq(notificationTable.userId, ctx.user.id), eq(notificationTable.isRead, false)))

    return true
  }

  async create(
    { type, title, message, userId, documentId }: CreateNotificationParams,
    ctx: IContext
  ) {
    const [created] = await ctx.db
      .insert(notificationTable)
      .values({ type, title, message: message ?? null, userId, documentId: documentId ?? null })
      .returning()

    return created
  }
}

const notificationUseCase = new NotificationUseCase()
export default notificationUseCase
