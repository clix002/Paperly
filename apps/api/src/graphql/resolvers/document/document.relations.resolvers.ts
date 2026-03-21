import type { IContext } from "../../context"

type DocumentParent = {
  senderId: string | null
  receiverId: string | null
  templateId: string | null
  originalDocumentId: string | null
}

export const DocumentRelations = {
  sender: async (parent: DocumentParent, _: unknown, ctx: IContext) => {
    if (!parent.senderId) return null
    return ctx.dataLoaders.userDataLoader.load(parent.senderId)
  },
  receiver: async (parent: DocumentParent, _: unknown, ctx: IContext) => {
    if (!parent.receiverId) return null
    return ctx.dataLoaders.userDataLoader.load(parent.receiverId)
  },
  template: async (parent: DocumentParent, _: unknown, ctx: IContext) => {
    if (!parent.templateId) return null
    return ctx.dataLoaders.templateDataLoader.load(parent.templateId)
  },
  originalDocument: async (parent: DocumentParent, _: unknown, ctx: IContext) => {
    if (!parent.originalDocumentId) return null
    return ctx.dataLoaders.documentDataLoader.load(parent.originalDocumentId)
  },
}
