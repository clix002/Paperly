import { comment as commentTable, document as documentTable } from "@paperly/db"
import { and, eq } from "drizzle-orm"
import { GraphQLError } from "graphql"
import type { IContext } from "../../graphql/context"
import notificationUseCase from "../notification/notification.usecase"

class CommentUseCase {
  async getCommentsByDocument(args: { documentId: string }, ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    return ctx.db
      .select()
      .from(commentTable)
      .where(eq(commentTable.documentId, args.documentId))
      .orderBy(commentTable.createdAt)
  }

  async getDocumentsWithComments(ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    // Obtener documentos que tienen al menos un comentario
    const comments = await ctx.db
      .select({ documentId: commentTable.documentId })
      .from(commentTable)
      .groupBy(commentTable.documentId)

    const docIds = comments.map((c) => c.documentId)
    if (docIds.length === 0) return []

    const docs = await ctx.db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.isDeleted, false)))
      .orderBy(documentTable.updatedAt)

    return docs.filter((d) => docIds.includes(d.id))
  }

  async createComment(args: { documentId: string; content: string }, ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    // Verificar que el documento existe
    const [doc] = await ctx.db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.id, args.documentId), eq(documentTable.isDeleted, false)))
      .limit(1)

    if (!doc) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    // Crear comentario
    const [created] = await ctx.db
      .insert(commentTable)
      .values({
        content: args.content,
        documentId: args.documentId,
        authorId: ctx.user.id,
      })
      .returning()

    // Si es worker y el documento no está en in_review, cambiarlo
    if (ctx.user.role === "worker" && doc.status !== "in_review") {
      await ctx.db
        .update(documentTable)
        .set({ status: "in_review", updatedAt: new Date() })
        .where(eq(documentTable.id, args.documentId))
    }

    // Notificar a la otra parte
    const recipientId = ctx.user.role === "worker" ? doc.senderId : doc.receiverId
    if (recipientId) {
      await notificationUseCase.create(
        {
          type: "comment_received",
          title: `Nueva observación en: ${doc.title}`,
          message: `${ctx.user.name} escribió un comentario`,
          userId: recipientId,
          documentId: args.documentId,
        },
        ctx
      )
    }

    return created
  }
}

const commentUseCase = new CommentUseCase()
export default commentUseCase
