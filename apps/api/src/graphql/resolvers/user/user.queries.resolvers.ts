import userUseCase from "../../../usecase/user/user.usecase"
import type { IContext } from "../../context"

export const UserQueries = {
  me: async (_: unknown, __: unknown, ctx: IContext) => {
    if (!ctx.user) return null
    return userUseCase.getMe(ctx)
  },
  users: async (_: unknown, __: unknown, ctx: IContext) => {
    return userUseCase.getUsers(ctx)
  },
}
