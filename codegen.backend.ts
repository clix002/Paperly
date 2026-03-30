import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "./apps/api/src/graphql/typedefs/**/*.graphql",
  generates: {
    "apps/api/src/graphql/generated/backend.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        useIndexSignature: true,
        enumsAsTypes: true,
        contextType: "../context#IContext",
        scalars: {
          DateTime: "Date",
          JSON: "unknown",
        },
      },
    },
  },
}

export default config
