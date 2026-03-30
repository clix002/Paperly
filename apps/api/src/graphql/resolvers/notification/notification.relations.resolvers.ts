import type { IContext } from "../../context"

type NotificationParent = {
  documentId: string | null
}

export const NotificationRelations = {
  document: async (parent: NotificationParent, _: unknown, ctx: IContext) => {
    if (!parent.documentId) return null
    return ctx.dataLoaders.documentDataLoader.load(parent.documentId)
  },
}
