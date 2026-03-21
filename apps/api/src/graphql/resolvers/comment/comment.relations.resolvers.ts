import type { IContext } from "../../context"

export const CommentRelations = {
  author: (parent: { authorId: string }, _: unknown, ctx: IContext) => {
    return ctx.dataLoaders.userDataLoader.load(parent.authorId)
  },
  document: (parent: { documentId: string }, _: unknown, ctx: IContext) => {
    return ctx.dataLoaders.documentDataLoader.load(parent.documentId)
  },
}
