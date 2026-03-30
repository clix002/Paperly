import { template as templateTable } from "@paperly/db"
import { and, eq, ilike } from "drizzle-orm"
import { GraphQLError } from "graphql"
import type { IContext } from "../../graphql/context"

class TemplateUseCase {
  async getTemplateById(args: { id: string }, ctx: IContext) {
    const [tmpl] = await ctx.db
      .select()
      .from(templateTable)
      .where(eq(templateTable.id, args.id))
      .limit(1)
    return tmpl ?? null
  }

  async getTemplates(args: { query?: { search?: string; filters?: unknown } }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const conditions = []

    if (args.query?.search) {
      conditions.push(ilike(templateTable.title, `%${args.query.search}%`))
    }

    return ctx.db
      .select()
      .from(templateTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(templateTable.createdAt)
  }

  async createTemplate(args: { input: Record<string, unknown> }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const { title, description, contentJson, status, isPublic, categoryId } = args.input as {
      title: string
      description?: string
      contentJson?: unknown
      status?: string
      isPublic?: boolean
      categoryId?: string
    }

    const [tmpl] = await ctx.db
      .insert(templateTable)
      .values({
        title,
        description: description ?? null,
        contentJson: contentJson ?? null,
        status: (status as "draft") ?? "draft",
        isPublic: isPublic ?? false,
        categoryId: categoryId ?? null,
        createdById: ctx.user.id,
      })
      .returning()

    return tmpl
  }

  async updateTemplate(args: { id: string; input: Record<string, unknown> }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const existing = await this.getTemplateById({ id: args.id }, ctx)
    if (!existing) {
      throw new GraphQLError("Plantilla no encontrada", { extensions: { code: "NOT_FOUND" } })
    }

    const { title, description, contentJson, status, isPublic, categoryId } = args.input as {
      title?: string
      description?: string
      contentJson?: unknown
      status?: string
      isPublic?: boolean
      categoryId?: string
    }

    const [updated] = await ctx.db
      .update(templateTable)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(contentJson !== undefined && { contentJson }),
        ...(status !== undefined && { status: status as "draft" }),
        ...(isPublic !== undefined && { isPublic }),
        ...(categoryId !== undefined && { categoryId }),
        updatedAt: new Date(),
      })
      .where(eq(templateTable.id, args.id))
      .returning()

    return updated
  }

  async deleteTemplate(args: { id: string }, ctx: IContext) {
    if (!ctx.user || ctx.user.role !== "hr") {
      throw new GraphQLError("No autorizado", { extensions: { code: "UNAUTHORIZED" } })
    }

    const existing = await this.getTemplateById({ id: args.id }, ctx)
    if (!existing) {
      throw new GraphQLError("Plantilla no encontrada", { extensions: { code: "NOT_FOUND" } })
    }

    const [deleted] = await ctx.db
      .delete(templateTable)
      .where(eq(templateTable.id, args.id))
      .returning()

    return deleted
  }
}

const templateUseCase = new TemplateUseCase()
export default templateUseCase
