import commentUseCase from "../../../usecase/comment/comment.usecase"
import type { IContext } from "../../context"

export const CommentQueries = {
  getCommentsByDocument: async (
    _: unknown,
    args: { documentId: string; options?: { limit?: number; page?: number } },
    ctx: IContext
  ) => {
    return commentUseCase.getCommentsByDocument(args, ctx)
  },
  getDocumentsWithComments: async (_: unknown, __: unknown, ctx: IContext) => {
    return commentUseCase.getDocumentsWithComments(ctx)
  },
}
