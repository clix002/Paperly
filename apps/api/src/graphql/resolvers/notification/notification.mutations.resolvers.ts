import notificationUseCase from "../../../usecase/notification/notification.usecase"
import type { IContext } from "../../context"

export const NotificationMutations = {
  markNotificationRead: async (_: unknown, args: { id: string }, ctx: IContext) => {
    return notificationUseCase.markRead(args, ctx)
  },
  markAllNotificationsRead: async (_: unknown, __: unknown, ctx: IContext) => {
    return notificationUseCase.markAllRead(ctx)
  },
}
