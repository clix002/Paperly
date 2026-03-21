import type { IContext } from "../../context"

type TemplateParent = { createdById: string | null }

export const TemplateRelations = {
  createdBy: async (parent: TemplateParent, _: unknown, ctx: IContext) => {
    if (!parent.createdById) return null
    return ctx.dataLoaders.userDataLoader.load(parent.createdById)
  },
}
