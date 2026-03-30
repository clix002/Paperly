import userUseCase from "../../../usecase/user/user.usecase"
import type { IContext } from "../../context"

export const UserMutations = {
  saveUserSignature: async (_: unknown, args: { dataUrl: string }, ctx: IContext) => {
    return userUseCase.saveUserSignature(args, ctx)
  },
}
