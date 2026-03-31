# Arquitectura de Paperly

---

## Estructura del monorepo

```
Paperly/
├── apps/
│   ├── api/        ← Bun + Hono + GraphQL Yoga + Better Auth + Drizzle
│   └── web/        ← Next.js 16 + Apollo Client 4 + Better Auth client
├── packages/
│   ├── db/         ← Schema Drizzle + cliente PostgreSQL
│   └── shared/     ← Enums, Zod schemas, tipos TS compartidos
├── docker-compose.yml
└── turbo.json
```

El código compartido (`packages/shared`, `packages/db`) nunca tiene lógica de UI ni de servidor — solo tipos, schemas de validación y el cliente de base de datos.

---

## Capas del sistema

```mermaid
graph TB
    subgraph Web["apps/web — Next.js 16"]
        Pages["Pages / App Router"]
        Apollo["Apollo Client 4"]
        AuthClient["Better Auth client"]
        Canvas["Fabric.js canvas editor"]
    end

    subgraph API["apps/api — Bun + Hono"]
        GQL["GraphQL Yoga"]
        Auth["Better Auth server"]
        Upload["REST /upload · /uploads/:key"]
        UseCases["Use Cases"]
        Drizzle["Drizzle ORM"]
    end

    subgraph Infra["Infraestructura"]
        PG[("PostgreSQL")]
        R2["Cloudflare R2"]
    end

    Pages --> Apollo
    Pages --> AuthClient
    Apollo -->|"/api/graphql proxy"| GQL
    AuthClient -->|"/api/auth/* proxy"| Auth
    Canvas -->|"POST /upload"| Upload

    GQL --> UseCases
    Auth --> Drizzle
    UseCases --> Drizzle
    Upload --> R2
    Drizzle --> PG
```

---

## Autenticación

Better Auth maneja toda la capa de auth. En el frontend, las llamadas van a `/api/auth/*` que Next.js reescribe internamente hacia `http://api:4000/auth/*`.

```mermaid
sequenceDiagram
    participant Browser
    participant Next.js
    participant API

    Browser->>Next.js: POST /api/auth/sign-in
    Next.js->>API: POST /auth/sign-in (rewrite interno)
    API-->>Next.js: Set-Cookie: session
    Next.js-->>Browser: Set-Cookie propagado
```

La sesión viaja como cookie `httpOnly`. Apollo incluye `credentials: "include"` en cada request.

---

## GraphQL

Schema dividido por dominio en `apps/api/src/graphql/typedefs/`:

```
typedefs/
├── user/       ← me, users, saveUserSignature
├── document/   ← getDocuments, getDocumentById, CRUD, send, sign
└── comment/    ← getComments, createComment, commentAdded (subscription)
```

El frontend usa codegen (`@graphql-codegen`) para generar tipos TypeScript y `DocumentNode` tipados desde el schema. Nunca se escriben queries como strings en el cliente.

### Suscripciones en tiempo real

Los comentarios usan GraphQL Subscriptions via WebSocket (`graphql-transport-ws`). El servidor Bun maneja el upgrade directamente antes de pasar al handler de Hono:

```
Browser → ws://api:3000/graphql → Bun WS → graphql-ws makeServer → PubSub
```

El hook `useComments` (web) centraliza query + subscription + mutation. Cuando llega un `commentAdded`, escribe directo al cache de Apollo sin refetch.

### IA automática (Groq)

Cuando un worker envía una observación, el servidor dispara `sendAiResponse` sin await (fire & forget). Groq (llama-3.3-70b) genera la respuesta y se publica via pubsub — llega al browser en tiempo real por la misma suscripción.

```
createComment → pubsub.publish(userComment) → [async] Groq API → pubsub.publish(aiComment)
```

---

## Almacenamiento de archivos (Cloudflare R2)

**Problema:** `URL.createObjectURL()` genera URLs de blob temporales que no sobreviven un reload. Las imágenes y firmas insertadas en el canvas desaparecían al recargar.

**Solución:**

```mermaid
sequenceDiagram
    participant Browser
    participant API
    participant R2

    Browser->>API: POST /upload (FormData)
    API->>R2: PutObjectCommand
    R2-->>API: OK
    API-->>Browser: { url: "https://api/uploads/uuid.png" }
    Browser->>Browser: canvas.addImage(url) — URL persistente en JSON
    Note over Browser: JSON se guarda en DB con la URL de R2
    Browser->>API: GET /uploads/uuid.png (al recargar)
    API->>R2: GetObjectCommand (proxy)
    R2-->>API: stream
    API-->>Browser: imagen
```

Las URLs en el JSON del canvas siempre apuntan al proxy del API. Al recargar, Fabric.js las fetchea normalmente.

---

## Documentos y clones

El documento **original** vive en el sistema de HR. Al enviarlo, se crea un **clon** por trabajador con referencia al original (`originalId`).

```mermaid
graph LR
    Original["Documento original\nHR — editable"]
    ClonA["Clon → María\nstatus: signed ✅"]
    ClonB["Clon → Juan\nstatus: sent 📤"]
    ClonC["Clon → Sofía\nstatus: in_review ⏳"]

    Original -->|sendDocument| ClonA
    Original -->|sendDocument| ClonB
    Original -->|sendDocument| ClonC
```

Esto permite reenviar el mismo documento a múltiples trabajadores de forma independiente y mantener el original intacto.

---

## Estados del documento

```mermaid
stateDiagram-v2
    [*] --> draft : createDocument()
    draft --> active : guardar como activo
    draft --> template : guardar como plantilla
    draft --> deprecated : archivar
    active --> sent : sendDocument() → crea clon
    sent --> viewed : worker abre el doc
    viewed --> signed : worker firma
    viewed --> in_review : worker comenta
    in_review --> sent : HR corrige y reenvía
    signed --> completed
    completed --> archived
```

---

## Decisiones técnicas

### ¿Por qué Bun?
Runtime único para todo el monorepo. Más rápido que Node en I/O, TypeScript nativo sin compilar, compatible con el ecosistema npm.

### ¿Por qué GraphQL + REST mixto?
GraphQL para el dominio de negocio — el cliente pide exactamente los campos que necesita. REST solo para uploads (`/upload`) porque `multipart/FormData` es más simple que base64 sobre GraphQL.

### ¿Por qué Better Auth en lugar de Supabase Auth?
Control total sobre el schema de usuario (campos custom: `signatureUrl`, `role`) sin depender de un servicio externo. La sesión es una cookie `httpOnly` gestionada por el propio API.

### ¿Por qué Fabric.js?
Editor canvas maduro con serialización/deserialización JSON, grupos, transformaciones y modos (edición completa vs. solo firma). Adaptado de un proyecto previo.

### ¿Por qué Cloudflare R2?
Free tier generoso (10 GB/mes, sin costo por egress). API S3-compatible — se usa `@aws-sdk/client-s3` sin SDK propietario. Las imágenes se sirven via proxy del API para evitar CORS y problemas con URLs públicas de desarrollo.
