import commentUseCase from "../../../usecase/comment/comment.usecase"
import type { IContext } from "../../context"

export const CommentMutations = {
  createComment: async (
    _: unknown,
    args: { documentId: string; content: string },
    ctx: IContext
  ) => {
    return commentUseCase.createComment(args, ctx)
  },
}
