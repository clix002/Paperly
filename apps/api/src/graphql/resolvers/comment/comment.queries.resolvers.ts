import commentUseCase from "../../../usecase/comment/comment.usecase"
import type { IContext } from "../../context"

export const CommentQueries = {
  getCommentsByDocument: async (_: unknown, args: { documentId: string }, ctx: IContext) => {
    return commentUseCase.getCommentsByDocument(args, ctx)
  },
  getDocumentsWithComments: async (_: unknown, __: unknown, ctx: IContext) => {
    return commentUseCase.getDocumentsWithComments(ctx)
  },
}
