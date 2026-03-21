import templateUseCase from "../../../usecase/template/template.usecase"
import type { IContext } from "../../context"

export const TemplateQueries = {
  getTemplateById: async (_: unknown, args: { id: string }, ctx: IContext) => {
    return templateUseCase.getTemplateById(args, ctx)
  },
  getTemplates: async (
    _: unknown,
    args: { query?: { search?: string; filters?: unknown } },
    ctx: IContext
  ) => {
    return templateUseCase.getTemplates(args, ctx)
  },
}
