import notificationUseCase from "../../../usecase/notification/notification.usecase"
import type { IContext } from "../../context"

export const NotificationQueries = {
  getMyNotifications: async (_: unknown, __: unknown, ctx: IContext) => {
    return notificationUseCase.getMyNotifications(ctx)
  },
  getUnreadCount: async (_: unknown, __: unknown, ctx: IContext) => {
    return notificationUseCase.getUnreadCount(ctx)
  },
}
