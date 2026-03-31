"use client"

import { ApolloLink, HttpLink } from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs"
import { createClient } from "graphql-ws"

function makeClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  })

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/graphql"

  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      shouldRetry: () => true,
      retryAttempts: 5,
      on: {
        connected: () => console.log("[ws] connected to", wsUrl),
        closed: (e) => console.log("[ws] closed", e),
        error: (e) => console.error("[ws] error", e),
      },
    })
  )

  const splitLink = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === "OperationDefinition" && definition.operation === "subscription"
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
  })
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>
}
