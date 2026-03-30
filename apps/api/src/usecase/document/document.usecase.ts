import {
  documentDistribution,
  document as documentTable,
  history,
  user as userTable,
} from "@paperly/db"
import { and, desc, eq, ilike } from "drizzle-orm"
import { GraphQLError } from "graphql"
import { paginate } from "../../domain/services/pagination"
import type { IContext } from "../../graphql/context"
import type { QueryGetDocumentsArgs } from "../../graphql/generated/backend"
import notificationUseCase from "../notification/notification.usecase"

class DocumentUseCase {
  async getDocumentById(args: { id: string }, ctx: IContext) {
    const [doc] = await ctx.db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.id, args.id), eq(documentTable.isDeleted, false)))
      .limit(1)
    return doc ?? null
  }

  async getDocuments({ query, options }: QueryGetDocumentsArgs, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const conditions = [eq(documentTable.isDeleted, false)]

    if (query?.search) {
      conditions.push(ilike(documentTable.title, `%${query.search}%`))
    }

    const where = and(...conditions)

    return paginate({
      db: ctx.db,
      table: documentTable,
      where,
      options,
      query: ctx.db
        .select()
        .from(documentTable)
        .where(where)
        .orderBy(desc(documentTable.createdAt)),
    })
  }

  async getDocumentsByReceiver(ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    return ctx.db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.receiverId, ctx.user.id), eq(documentTable.isDeleted, false)))
      .orderBy(desc(documentTable.createdAt))
  }

  async createDocument(args: { input: Record<string, unknown> }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const { title, contentJson, requiresSignature, templateId, categoryId, status } =
      args.input as {
        title: string
        contentJson?: unknown
        requiresSignature?: boolean
        templateId?: string
        categoryId?: string
        status?: string
      }

    const [doc] = await ctx.db
      .insert(documentTable)
      .values({
        title,
        contentJson: contentJson ?? null,
        requiresSignature: requiresSignature ?? false,
        templateId: templateId ?? null,
        categoryId: categoryId ?? null,
        status: (status as "draft") ?? "draft",
        senderId: ctx.user.id,
      })
      .returning()

    return doc
  }

  async updateDocument(args: { id: string; input: Record<string, unknown> }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const existing = await this.getDocumentById({ id: args.id }, ctx)
    if (!existing) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    const { title, contentJson, requiresSignature, status, templateId, categoryId } =
      args.input as {
        title?: string
        contentJson?: unknown
        requiresSignature?: boolean
        status?: string
        templateId?: string
        categoryId?: string
      }

    const [updated] = await ctx.db
      .update(documentTable)
      .set({
        ...(title !== undefined && { title }),
        ...(contentJson !== undefined && { contentJson }),
        ...(requiresSignature !== undefined && { requiresSignature }),
        ...(status !== undefined && {
          status: status as (typeof documentTable.$inferInsert)["status"],
        }),
        ...(templateId !== undefined && { templateId }),
        ...(categoryId !== undefined && { categoryId }),
        updatedAt: new Date(),
      })
      .where(eq(documentTable.id, args.id))
      .returning()

    return updated
  }

  async deleteDocument(args: { id: string }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const existing = await this.getDocumentById({ id: args.id }, ctx)
    if (!existing) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    const [deleted] = await ctx.db
      .update(documentTable)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(documentTable.id, args.id))
      .returning()

    return deleted
  }

  async sendDocument(args: { id: string; receiverId: string }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const original = await this.getDocumentById({ id: args.id }, ctx)
    if (!original) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    // Verificar que el receiver existe
    const [receiver] = await ctx.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, args.receiverId))
      .limit(1)
    if (!receiver) {
      throw new GraphQLError("Destinatario no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    // Crear clon del documento para el worker
    const cloneResult = await ctx.db
      .insert(documentTable)
      .values({
        title: original.title,
        contentJson: original.contentJson,
        requiresSignature: original.requiresSignature,
        templateId: original.templateId,
        categoryId: original.categoryId,
        senderId: ctx.user.id,
        receiverId: args.receiverId,
        originalDocumentId: original.id,
        status: "sent",
      })
      .returning()
    const clone = cloneResult[0]
    if (!clone)
      throw new GraphQLError("Error al crear clon", { extensions: { code: "INTERNAL_ERROR" } })

    // Crear registro de distribución
    await ctx.db.insert(documentDistribution).values({
      documentId: clone.id,
      senderId: ctx.user.id,
      receiverId: args.receiverId,
      status: "sent",
      sentAt: new Date(),
    })

    // Registrar en historial + notificar al worker
    await Promise.all([
      ctx.db.insert(history).values({
        documentId: clone.id,
        action: "ENVIADO",
        changesJson: {
          message: `Documento enviado a ${receiver.name}`,
          originalDocumentId: original.id,
        },
        userId: ctx.user.id,
      }),
      notificationUseCase.create(
        {
          type: "document_sent",
          title: `Nuevo documento: ${original.title}`,
          message: `${ctx.user.name} te envió un documento para ${original.requiresSignature ? "firmar" : "revisar"}`,
          userId: args.receiverId,
          documentId: clone.id,
        },
        ctx
      ),
    ])

    return clone
  }

  async signDocument(args: { id: string; contentJson?: unknown }, ctx: IContext) {
    if (!ctx.user) {
      throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } })
    }

    const doc = await this.getDocumentById({ id: args.id }, ctx)
    if (!doc) {
      throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } })
    }

    if (doc.receiverId !== ctx.user.id) {
      throw new GraphQLError("No autorizado para firmar este documento", {
        extensions: { code: "UNAUTHORIZED" },
      })
    }

    const [signed] = await ctx.db
      .update(documentTable)
      .set({
        status: "signed",
        updatedAt: new Date(),
        ...(args.contentJson !== undefined && { contentJson: args.contentJson }),
      })
      .where(eq(documentTable.id, args.id))
      .returning()

    // Actualizar distribución
    await ctx.db
      .update(documentDistribution)
      .set({ status: "signed", signedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(documentDistribution.documentId, args.id),
          eq(documentDistribution.receiverId, ctx.user.id)
        )
      )

    await Promise.all([
      ctx.db.insert(history).values({
        documentId: args.id,
        action: "FIRMADO",
        changesJson: { message: "Documento firmado por el trabajador" },
        userId: ctx.user.id,
      }),
      doc.senderId
        ? notificationUseCase.create(
            {
              type: "document_signed",
              title: `Documento firmado: ${doc.title}`,
              message: `${ctx.user.name} firmó el documento`,
              userId: doc.senderId,
              documentId: args.id,
            },
            ctx
          )
        : Promise.resolve(),
    ])

    return signed
  }
}

const documentUseCase = new DocumentUseCase()
export default documentUseCase
