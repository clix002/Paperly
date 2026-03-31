import { comment as commentTable, document as documentTable } from "@paperly/db"
import { and, eq } from "drizzle-orm"
import { GraphQLError } from "graphql"
import type { IContext } from "../../graphql/context"
import { generateAiResponse } from "../../lib/ai"
import { pubSub } from "../../lib/pubsub"
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

    const [doc] = await ctx.db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.id, args.documentId), eq(documentTable.isDeleted, false)))
      .limit(1)

    if (!doc) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    const [created] = await ctx.db
      .insert(commentTable)
      .values({
        content: args.content,
        documentId: args.documentId,
        authorId: ctx.user.id,
      })
      .returning()

    if (created) pubSub.publish(`COMMENT_ADDED:${args.documentId}`, created)

    if (ctx.user.role === "worker" && doc.status !== "in_review") {
      await ctx.db
        .update(documentTable)
        .set({ status: "in_review", updatedAt: new Date() })
        .where(eq(documentTable.id, args.documentId))
    }

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

    if (ctx.user.role === "worker" && doc.senderId) {
      this.sendAiResponse({
        doc: { ...doc, contentJson: doc.contentJson as string | null },
        observation: args.content,
        workerName: ctx.user.name ?? "Trabajador",
        hrUserId: doc.senderId,
        db: ctx.db,
      })
    }

    return created
  }

  private async sendAiResponse(params: {
    doc: { id: string; title: string; contentJson: string | null }
    observation: string
    workerName: string
    hrUserId: string
    db: IContext["db"]
  }) {
    const aiText = await generateAiResponse({
      documentTitle: params.doc.title,
      documentContent: params.doc.contentJson,
      workerName: params.workerName,
      observation: params.observation,
    })

    console.log("[ai] response:", aiText ? aiText.slice(0, 80) : "null (falló o no hay key)")
    if (!aiText) return

    const [aiComment] = await params.db
      .insert(commentTable)
      .values({
        content: aiText,
        documentId: params.doc.id,
        authorId: params.hrUserId,
        isAi: true,
      })
      .returning()

    if (aiComment) pubSub.publish(`COMMENT_ADDED:${params.doc.id}`, aiComment)
  }
}

const commentUseCase = new CommentUseCase()
export default commentUseCase
