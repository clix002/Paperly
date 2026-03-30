# Arquitectura de Paperly

## Visión general

```mermaid
graph TB
    subgraph frontend["FRONT (Next.js)<br/>:3001"]
        dashboard["Dashboard"]
        editor["Canvas Editor"]
        firma["Vista de Firma"]
        tracking["Seguimiento"]
        queries["Consultas"]
        notif["Notificaciones"]
    end

    subgraph backend["BACKEND (Bun + Hono)<br/>:3000"]
        graphql["GraphQL Yoga<br/>(/graphql)"]
        auth["Better Auth<br/>(/auth/**)"]
        resolvers["Resolvers<br/>Document, Comment<br/>Notification, User<br/>Template"]
    end

    subgraph database["DATABASE (PostgreSQL)"]
        db["users | documents<br/>templates | comments<br/>notifications<br/>document_distribution<br/>history"]
    end

    frontend -->|GraphQL + REST<br/>Apollo Client| backend
    backend -->|Drizzle ORM| database
```

---

## Carpetas clave

### `/apps/api`
- **`src/index.ts`** — Punto de entrada, Hono app
- **`src/graphql/`** — Typedefs, resolvers, schema
- **`src/usecase/`** — Lógica de negocio (CRUD, workflows)
- **`src/auth/`** — Rutas de Better Auth
- **`src/lib/env.ts`** — Variables de entorno

### `/apps/web`
- **`app/(app)/`** — Rutas principales
  - `dashboard/` — Worker: lista de docs
  - `hr/` — RR.HH.: dashboard, documents, send, queries, tracking
- **`components/`** — Componentes reutilizables
  - `layout/` — Sidebar, header, notificaciones
  - `editor/` — Canvas editor (Fabric.js)
  - `hr/` — Componentes HR (attention-list, tracking-kanban, etc.)
- **`lib/apollo/`** — GraphQL operations (`.graphql` + generados)

### `/packages/db`
- **`src/schema/`** — Tablas Drizzle (user, document, comment, etc.)
- **`drizzle.config.ts`** — Configuración ORM

### `/packages/shared`
- **`enums/`** — Enums tipados (Role, DocumentStatus, NotificationType)
- **`schemas/`** — Zod schemas para validación

---

## Flujo de datos

### 1. Crear y enviar documento

```mermaid
sequenceDiagram
    actor HR
    participant UI
    participant API
    participant DB

    HR->>UI: Click "Create Document"
    UI->>API: CreateDocument mutation
    API->>API: Valida que sea HR
    API->>DB: INSERT documento (status=draft)
    DB-->>API: Doc creado
    API-->>UI: Retorna doc

    HR->>UI: Click "Send"
    UI->>API: sendDocument(id, receiverId)
    API->>API: Valida doc existe
    API->>DB: INSERT clon del doc (status=sent)
    API->>DB: INSERT documentDistribution
    API->>DB: INSERT history entry
    API->>DB: INSERT notification
    DB-->>API: Done
    API-->>HR: ✅ Enviado al worker
```

### 2. Firma del documento

```mermaid
sequenceDiagram
    actor Worker
    participant UI
    participant API
    participant DB

    Worker->>UI: Click "Firmar"
    UI->>API: signDocument(id, signature)
    API->>API: Valida que sea el receptor
    API->>DB: UPDATE doc status=signed
    API->>DB: UPDATE documentDistribution status=signed
    API->>DB: INSERT history entry
    API->>DB: INSERT notification al HR
    DB-->>API: Done
    API-->>UI: ✅ Documento firmado
```

### 3. Comentario (error/observación)

```mermaid
sequenceDiagram
    actor User as Worker o HR
    participant UI
    participant API
    participant DB

    User->>UI: Click "Report issue"
    UI->>API: createComment(docId, content)
    API->>API: Valida autenticado
    API->>API: Si worker → status=in_review
    API->>DB: INSERT comentario
    API->>DB: INSERT notificación a la otra parte
    DB-->>API: Done
    API-->>UI: ✅ Comentario enviado
```

---

## Estados del documento

```mermaid
stateDiagram-v2
    [*] --> DRAFT: HR crea
    DRAFT --> SENT: HR envía (se crea clon)
    SENT --> VIEWED: Worker abre doc
    VIEWED --> SIGNED: Worker firma
    VIEWED --> IN_REVIEW: Worker reporta error
    IN_REVIEW --> SENT: HR corrige y reenvía
    SIGNED --> COMPLETED: Documento listo
    COMPLETED --> ARCHIVED: Archivar
    VIEWED --> REJECTED: Worker rechaza
    REJECTED --> ARCHIVED
```

---

## Notificaciones

Auto-creadas en:
- **`sendDocument`** → `document_sent` al worker
- **`signDocument`** → `document_signed` al HR sender
- **`createComment`** → `comment_received` a la otra parte

Tipos de notificación:
```typescript
enum NotificationType {
  DOCUMENT_SENT
  DOCUMENT_VIEWED
  DOCUMENT_SIGNED
  DOCUMENT_REJECTED
  DOCUMENT_COMPLETED
  COMMENT_RECEIVED
  DOCUMENT_IN_REVIEW
}
```

---

## Autenticación

**Better Auth** maneja:
- Login / Register
- Sesiones (cookies)
- Password reset
- User profile

Frontend:
```typescript
const { data: session } = useSession()
const user = session?.user
const role = user?.role // "hr" o "worker"
```

Backend:
```typescript
interface IContext {
  user: { id, email, name, role, ... }
  db: Database
}
```

---

## GraphQL

### Queries principales

```graphql
# Worker
getDocumentsByReceiver()  # Mis documentos pendientes
getDocumentById(id)      # Detalle de un documento
getMyNotifications()     # Mis notificaciones

# HR
getDocuments(query, options)  # Todos los documentos (con paginación)
users()                   # Listar workers para envío
getDocumentsWithComments()    # Docs que tienen comentarios

# Compartido
me()                      # Perfil del usuario logueado
```

### Mutations principales

```graphql
# Documentos
createDocument(input)
updateDocument(id, input)
deleteDocument(id)
sendDocument(id, receiverId)
signDocument(id, contentJson)

# Comentarios
createComment(documentId, content)

# Notificaciones
markNotificationRead(id)
markAllNotificationsRead()

# Auth
signUp(email, password, name)
signIn(email, password)
signOut()
```

---

## Canvas editor

**Fabric.js v7** con 3 modos:

1. **Create** (HR nuevo documento)
   - Todas las herramientas (texto, formas, imágenes, firma, etc.)
   - Guardar como borrador o plantilla

2. **Document** (HR editar documento)
   - Todas las herramientas (excepto templates)
   - Auto-save cada 500ms

3. **Sign** (Worker firma)
   - Solo herramienta de firma
   - No puede editar el documento

4. **View** (Worker lectura)
   - No puede editar
   - Solo ver

---

## Tipado

**GraphQL Codegen** genera automáticamente:
- Tipos de operaciones GraphQL
- Resolvers tipados
- Esquema TypeScript

```bash
bun run codegen  # Regenerar tipos
```

---

## Testing local

```bash
# API GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ me { id name role } }"}'

# Drizzle Studio (visual DB)
cd packages/db && bun run db:studio
```

---

## Deploy

Ver [DEPLOY.md](../DEPLOY.md) para instrucciones de CubePath.
