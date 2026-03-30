import { makeExecutableSchema } from "@graphql-tools/schema"
import {
  CommentMutations,
  CommentQueries,
  CommentRelations,
  DocumentMutations,
  DocumentQueries,
  DocumentRelations,
  NotificationMutations,
  NotificationQueries,
  NotificationRelations,
  TemplateMutations,
  TemplateQueries,
  TemplateRelations,
  UserMutations,
  UserQueries,
} from "./resolvers"
import { typeDefs } from "./typedefs"

function createSchema() {
  const resolvers = {
    Query: {
      ...UserQueries,
      ...DocumentQueries,
      ...TemplateQueries,
      ...CommentQueries,
      ...NotificationQueries,
    },
    Mutation: {
      ...DocumentMutations,
      ...TemplateMutations,
      ...CommentMutations,
      ...UserMutations,
      ...NotificationMutations,
    },
    Document: DocumentRelations,
    Template: TemplateRelations,
    Comment: CommentRelations,
    Notification: NotificationRelations,
  }

  return makeExecutableSchema({
    typeDefs,
    resolvers,
  })
}

export const schema = createSchema()
