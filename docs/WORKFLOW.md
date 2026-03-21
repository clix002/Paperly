# Flujos de trabajo

## 1. RR.HH. crea y envía documento

### Paso 1: Crear documento

1. HR entra a `/hr/documents` → **New document**
2. Se abre canvas editor en modo **Create**
3. HR arrastra elementos (texto, imágenes, firma de empresa, etc.)
4. HR guarda como:
   - **Draft** — para seguir editando después
   - **Active** — listo para enviar
   - **Template** — guardar como plantilla reutilizable

**DB:**
- Crea entrada en `documents` con `status = "draft" | "active" | "template"`

### Paso 2: Enviar a trabajador

1. HR entra a `/hr/send`
2. Selecciona documento activo
3. Selecciona trabajador(es)
4. Clickea **Send**

**Backend:**
```
sendDocument mutation
  ├─ Valida que sea HR
  ├─ Verifica doc existe
  ├─ Crea CLON del doc para el worker
  │   (status = "sent", receiverId = worker.id)
  ├─ Inserta en documentDistribution
  ├─ Crea history entry "ENVIADO"
  └─ Crea notificación al worker
```

**DB:**
- Nuevo doc clonado en `documents`
- Nueva entrada en `document_distribution` con `status = "sent"`
- Nueva entrada en `history` con `action = "ENVIADO"`
- Nueva entrada en `notification` tipo `document_sent`

**Worker:**
- Recibe notificación con campana en sidebar

---

## 2. Trabajador revisa y firma

### Paso 1: Abrir documento

1. Worker entra a `/dashboard` ve lista de documentos pendientes
2. Clickea en documento
3. Se abre canvas en modo **Sign** (solo puede firmar) o **View** (solo lectura)

**Backend:**
```
Cuando worker abre el doc:
  ├─ Sistema detecta status = "sent"
  └─ Cambia automáticamente a "viewed"
```

**DB:**
- `documents.status` cambió de `"sent"` → `"viewed"`
- Nueva entrada en `history` con `action = "VISTO"`

### Paso 2a: Firma el documento (happy path)

1. Worker cliquea botón **Sign**
2. Canvas en modo Sign abre panel de firma
3. Worker puede:
   - Dibujar firma en tiempo real
   - Usar firma guardada del perfil (si existe)
4. Cliquea **Confirm signature**

**Backend:**
```
signDocument mutation
  ├─ Valida que sea el receptor
  ├─ Actualiza status a "signed"
  ├─ Actualiza distributionStatus a "signed"
  ├─ Crea history entry "FIRMADO"
  └─ Crea notificación al HR sender
```

**DB:**
- `documents.status` → `"signed"`
- `document_distribution.status` → `"signed"`, `signedAt = now`
- Nueva entrada en `history` con `action = "FIRMADO"`
- Nueva notificación tipo `document_signed` al HR

**HR:**
- Ve notificación "Documento firmado"
- Puede ver el documento en `/hr/tracking` con status actualizado

### Paso 2b: Reporta error (unhappy path)

1. Worker cliquea botón **Report issue**
2. Se abre sidebar de comentarios
3. Worker escribe comentario (error, aclaración, etc.)
4. Cliquea **Send**

**Backend:**
```
createComment mutation
  ├─ Valida que sea autenticado
  ├─ Si worker → cambia doc status a "in_review"
  ├─ Inserta comentario en DB
  └─ Crea notificación al HR sender
```

**DB:**
- Nuevo comentario en `comments`
- `documents.status` → `"in_review"`
- Nueva entrada en `history` con `action = "EN_REVISIÓN"`
- Nueva notificación tipo `comment_received` al HR

**HR:**
- Ve el documento en estado **In Review** en `/hr/tracking`
- Ve la campanilla de notificación
- Puede entrar a `/hr/queries` para ver comentario y responder

---

## 3. RR.HH. responde y corrige

### Paso 1: Ver comentarios

1. HR entra a `/hr/queries`
2. Ve lista de documentos que tienen comentarios pendientes
3. Cliquea en uno
4. Se abre panel derecho con conversación completa

**UI:**
- Panel izquierdo: lista de documentos con comentarios
- Panel derecho: chat con mensajes (HR a la derecha, Worker a la izquierda)

### Paso 2: Responder

HR puede:
- Responder directamente en el chat
- O corregir el documento

**Si responde:**
1. Escribe un comentario
2. Cliquea **Send**
3. Worker recibe notificación `comment_received`

**Si corrige:**
1. HR entra a `/hr/documents` → edita el documento
2. Lo abre en modo **Document** (puede editar todo)
3. Corrige los errores
4. Guarda cambios (auto-save cada 500ms)
5. Vuelve a `/hr/send` y lo reenvía

**Backend (al reenviar):**
```
sendDocument mutation (de nuevo)
  ├─ Crea NUEVO clon del documento corregido
  ├─ Documento anterior queda en "in_review"
  ├─ Nuevo clone sale con status = "sent"
  ├─ Crea history entry "REENVIADO"
  └─ Crea notificación al worker
```

**DB:**
- Nuevo doc clonado con cambios
- Antigua versión queda en `"in_review"` (para histórico)
- Nueva notificación tipo `document_sent` al worker

---

## 4. Estados finales

### Completed ✅

```
Worker firma documento
  ↓
Status pasa a "signed"
  ↓
HR ve notificación
  ↓
Status puede cambiar a "completed" (opcional)
  ↓
Después a "archived"
```

**DB:**
- `documents.status` → `"completed"`
- Entrada en `history` con `action = "COMPLETADO"`

### Rejected ❌

Worker puede rechazar un documento:
```
Worker cliquea "Reject"
  ↓
Status → "rejected"
  ↓
Notificación al HR
  ↓
Puede ser reenviado o cancelado
```

---

## Notificaciones

Se crean automáticamente en:

| Evento | Tipo | Recibe | Quién envía |
|--------|------|--------|------------|
| HR envía doc | `document_sent` | Worker | HR |
| Worker firma | `document_signed` | HR | Worker |
| Worker comenta | `comment_received` | HR | Worker |
| HR comenta | `comment_received` | Worker | HR |

**UI:**
- Campana en sidebar
- Badge con contador de no leídas
- Polling cada 30 segundos para actualizar contador
- Click en notificación → deep link al documento

---

## Estados del documento (completos)

```
┌─────────────────────────────────────────────┐
│              LIFECYCLE DEL DOCUMENTO        │
└─────────────────────────────────────────────┘

HR crea documento
      ↓
    DRAFT (editando)
      ↓
    ACTIVE (listo para enviar)
      ↓
HR envía → se crea CLON
      ↓
    SENT (en poder del worker)
      ↓
Worker abre
      ↓
    VIEWED (worker lo vio)
      ↓
     ┌──────────────────┬─────────────────┐
     ↓                  ↓                  ↓
  SIGNED           IN_REVIEW          REJECTED
  (firmó)          (reportó error)     (rechazó)
     ↓                  ↓                  ↓
COMPLETED            SENT              ARCHIVED
(listo)          (reenvío de HR)
     ↓
ARCHIVED
(histórico)
```

---

## Datos que se guardan

### Por documento:
- `id` — UUID
- `title` — nombre
- `contentJson` — canvas (Fabric.js)
- `status` — estado actual
- `senderId` — quién lo envió
- `receiverId` — quién lo recibe (worker)
- `originalDocumentId` — si es clon, apunta al original
- `createdAt`, `updatedAt`

### Por evento (history):
- `documentId` — cuál doc
- `action` — "ENVIADO", "VISTO", "FIRMADO", "EN_REVISIÓN", etc.
- `userId` — quién hizo la acción
- `changesJson` — detalles adicionales
- `createdAt`

### Por notificación:
- `type` — documento_enviado, firmado, etc.
- `title` — "Nuevo documento: Contrato"
- `message` — "Ana te envió un documento para firmar"
- `userId` — quién la recibe
- `isRead` — leída o no
- `documentId` — documento relacionado
- `createdAt`
