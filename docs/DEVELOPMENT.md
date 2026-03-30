# Guía de desarrollo

## Setup inicial

```bash
git clone https://github.com/clix002/Paperly
cd Paperly
bun install
docker compose up -d
cd packages/db && bun run db:push && cd ../..
```

## Correr en desarrollo

```bash
# Terminal 1: API
cd apps/api && bun run dev

# Terminal 2: Web
cd apps/web && bun run dev -- -p 3001

# Terminal 3 (opcional): Drizzle Studio
cd packages/db && bun run db:studio
```

## Estructura de commits

Usa commits cortos y descriptivos:

```bash
git commit -m "feat(module): descripción corta

- detalle si es necesario
- otro detalle"

# Prefijos:
# feat   - nueva feature
# fix    - bug fix
# chore  - cambios en config/build
# docs   - documentación
# refactor - refactoring
```

## Agregar una nueva feature

### 1. Backend (API)

**Crear mutation/query:**

```typescript
// apps/api/src/graphql/typedefs/documento/documento.mutations.graphql
mutation MiMutation($id: ID!) {
  miMutation(id: $id) {
    id
    nombre
  }
}
```

**Crear resolver:**

```typescript
// apps/api/src/graphql/resolvers/documento/documento.mutations.resolvers.ts
export const DocumentMutations: MutationResolvers = {
  miMutation: async (_, args, ctx) => {
    return documentUseCase.miMetodo(args, ctx)
  }
}
```

**Agregar lógica en usecase:**

```typescript
// apps/api/src/usecase/documento/documento.usecase.ts
async miMetodo(args: { id: string }, ctx: IContext) {
  if (!ctx.user) {
    throw new GraphQLError("No autenticado", {
      extensions: { code: "UNAUTHENTICATED" }
    })
  }
  // Lógica aquí
}
```

### 2. Frontend (Web)

**Crear operación GraphQL:**

```graphql
# apps/web/lib/apollo/operations/documento.graphql
mutation MiMutation($id: ID!) {
  miMutation(id: $id) {
    id
    nombre
  }
}
```

**Ejecutar codegen:**

```bash
bun run codegen
```

**Usar en componente:**

```typescript
import { useMutation } from "@apollo/client/react"
import { MiMutationDocument } from "@/lib/apollo/generated/graphql"

export function MiComponente() {
  const [miMutation, { loading }] = useMutation(MiMutationDocument)

  const handleClick = async () => {
    const result = await miMutation({ variables: { id: "123" } })
    console.log(result.data)
  }

  return <button onClick={handleClick}>{loading ? "..." : "Enviar"}</button>
}
```

## Lint y formato

```bash
# Verificar
bun run lint

# Arreglar automáticamente
bunx biome check --write apps/
```

## Type checking

```bash
# Verificar tipos en ambas apps
bunx tsc --noEmit -p apps/api/tsconfig.json
bunx tsc --noEmit -p apps/web/tsconfig.json

# O ambas al mismo tiempo
bun run typecheck
```

## Base de datos

### Agregar una tabla

```typescript
// packages/db/src/schema/miTabla.ts
export const miTabla = pgTable("mi_tabla", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  nombre: text("nombre").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

### Crear migration

```bash
cd packages/db
bun run db:generate
bun run db:migrate
```

## Usuarios de prueba

Están creados en `apps/api/src/seed.ts`. Para usar:

```
Email: ana@paperly.com (HR)
       maria@paperly.com (Worker)
Pass: password123
```

Para re-seedear:

```bash
cd apps/api
bun run src/seed.ts
```

## Debugging

### API

```bash
cd apps/api
bun run dev --debug
```

### Web

```bash
# En Chrome: chrome://inspect
cd apps/web
bun --inspect-brk run dev -- -p 3001
```

### GraphQL

Abre http://localhost:3000/graphql para ver GraphiQL explorer.

## Variables de entorno

### API

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/paperly
BETTER_AUTH_SECRET=pon-algo-aleatorio-32-caracteres
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
PORT=3000
```

### Web

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
BETTER_AUTH_SECRET=mismo-que-API
```

## Troubleshooting

### `Cannot find module '@paperly/db'`

```bash
# Reinstalar desde root
cd Paperly && bun install
```

### `GraphQL type error`

```bash
# Regenerar tipos
bun run codegen
```

### `Port already in use`

```bash
# Cambiar puerto
cd apps/web && bun run dev -- -p 3002
```

### `PostgreSQL connection refused`

```bash
# Verificar que está corriendo
docker compose ps

# Si no, levantar
docker compose up -d postgres
```

## Performance

- Auto-save en canvas es **debounced 500ms**
- Paginación de documentos: **20 por página**
- Notificaciones polling: **30 segundos**

Si necesita cambiar, editar en los respectivos componentes.
