import type { IContext } from "./context"
import {
  getDocumentDataLoader,
  getTemplateDataLoader,
} from "./resolvers/document/document.dataloaders"
import { getUserDataLoader } from "./resolvers/user/user.dataloaders"

export const getDataLoaders = (ctx: IContext) => ({
  userDataLoader: getUserDataLoader(ctx),
  documentDataLoader: getDocumentDataLoader(ctx),
  templateDataLoader: getTemplateDataLoader(ctx),
})

export type DataLoaders = ReturnType<typeof getDataLoaders>
