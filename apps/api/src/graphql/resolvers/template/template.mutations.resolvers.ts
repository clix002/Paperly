import templateUseCase from "../../../usecase/template/template.usecase"
import type { IContext } from "../../context"

export const TemplateMutations = {
  createTemplate: async (_: unknown, args: { input: Record<string, unknown> }, ctx: IContext) => {
    return templateUseCase.createTemplate(args, ctx)
  },
  updateTemplate: async (
    _: unknown,
    args: { id: string; input: Record<string, unknown> },
    ctx: IContext
  ) => {
    return templateUseCase.updateTemplate(args, ctx)
  },
  deleteTemplate: async (_: unknown, args: { id: string }, ctx: IContext) => {
    return templateUseCase.deleteTemplate(args, ctx)
  },
}
