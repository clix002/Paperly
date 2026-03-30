import documentUseCase from "../../../usecase/document/document.usecase"
import type { IContext } from "../../context"

export const DocumentMutations = {
  createDocument: async (_: unknown, args: { input: Record<string, unknown> }, ctx: IContext) => {
    return documentUseCase.createDocument(args, ctx)
  },
  updateDocument: async (
    _: unknown,
    args: { id: string; input: Record<string, unknown> },
    ctx: IContext
  ) => {
    return documentUseCase.updateDocument(args, ctx)
  },
  deleteDocument: async (_: unknown, args: { id: string }, ctx: IContext) => {
    return documentUseCase.deleteDocument(args, ctx)
  },
  sendDocument: async (_: unknown, args: { id: string; receiverId: string }, ctx: IContext) => {
    return documentUseCase.sendDocument(args, ctx)
  },
  signDocument: async (_: unknown, args: { id: string; contentJson?: unknown }, ctx: IContext) => {
    return documentUseCase.signDocument(args, ctx)
  },
}
