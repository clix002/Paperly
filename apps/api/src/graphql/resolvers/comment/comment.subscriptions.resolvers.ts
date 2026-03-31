import { pubSub } from "../../../lib/pubsub"

export const CommentSubscriptions = {
  commentAdded: {
    subscribe: (_: unknown, { documentId }: { documentId: string }) =>
      pubSub.subscribe(`COMMENT_ADDED:${documentId}`),
    resolve: (payload: unknown) => payload,
  },
}
