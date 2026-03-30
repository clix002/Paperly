import documentUseCase from "../../../usecase/document/document.usecase"
import type { QueryResolvers } from "../../generated/backend"

export const DocumentQueries: QueryResolvers = {
  getDocumentById: async (_, args, ctx) => {
    return documentUseCase.getDocumentById(args, ctx)
  },
  getDocuments: async (_, args, ctx) => {
    return documentUseCase.getDocuments(args, ctx)
  },
  getDocumentsByReceiver: async (_, __, ctx) => {
    return documentUseCase.getDocumentsByReceiver(ctx)
  },
}
