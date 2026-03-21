import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "./apps/api/src/graphql/typedefs/**/*.graphql",
  documents: "./apps/web/lib/apollo/operations/**/*.graphql",
  generates: {
    "apps/web/lib/apollo/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
