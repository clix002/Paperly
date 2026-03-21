# Ciclo de Vida de Documentos — Estados y Escenarios

## Principio Fundamental

> El documento original de HR **nunca se modifica** al enviarlo. Se crea un **clon** por cada trabajador asignado. Cada clon tiene su propio ciclo de vida independiente.

---

## Entidades Involucradas

| Entidad | Descripción |
|---------|-------------|
| **Documento Original** | Creado por HR. Vive en `/hr/documents`. Puede generar N clones. |
| **Documento Clon** | Copia del original enviada a un worker. Tiene `originalDocumentId` apuntando al original. Ciclo de vida propio. Vive en `/hr/tracking`. |
| **Comment** | Observación del worker o respuesta de HR, vinculado al clon. |

---

## Estados del Documento

### Documento Original (HR)

```
draft ──→ (se usa como fuente para clones)
```

El original solo tiene estado `draft`. No cambia de estado cuando se envía — se clona.

### Documento Clon (enviado a Worker)

```
sent ──→ viewed ──→ signed ──→ completed ──→ archived
                │
                ├──→ in_review ──→ viewed (marcar resuelto)
                │                    └──→ signed ──→ ...
                │
                └──→ rejected ──→ archived
```

---

## Matriz de Transiciones de Estado (Clon)

| Estado Actual | Acción | Nuevo Estado | Quién | Cómo |
|--------------|--------|-------------|-------|------|
| `sent` | Worker abre el documento | `viewed` | Worker | Automático al cargar |
| `viewed` | Worker firma | `signed` | Worker | Botón "Firmar" |
| `viewed` | Worker envía observación | `in_review` | Worker | Automático al crear comment |
| `viewed` | Worker rechaza | `rejected` | Worker | Botón "Rechazar" |
| `in_review` | HR marca resuelto | `viewed` | HR | Botón en panel lateral de Seguimiento |
| `signed` | HR marca completado | `completed` | HR | Botón en panel lateral de Seguimiento |
| `completed` | HR archiva | `archived` | HR | Botón en panel lateral de Seguimiento |
| `rejected` | HR archiva | `archived` | HR | Botón en panel lateral de Seguimiento |

### Transiciones NO permitidas

- `sent` → `signed` (debe pasar por `viewed` primero)
- `archived` → cualquier estado (estado terminal)
- `signed` → `in_review` (ya firmó, no hay vuelta)
- Worker no puede cambiar estado de `in_review` (solo HR)

### Implementación

Las transiciones de HR se ejecutan con la mutation `updateDocument(id, status)` usando el enum `DocumentStatus`. Están implementadas como botones contextuales en el panel lateral de `/hr/tracking` — cada estado muestra solo las acciones válidas.

---

## Escenarios

### Escenario 1: Documento de solo lectura — Flujo feliz

```
HR crea documento (requiresSignature=false)
  → HR envía a Worker (desde botón "Enviar" o menú ⋮ en /hr/documents)
    → [Clon: sent]
      → Worker abre → [Clon: viewed]
        → Fin (documento cumplió su propósito)
          → HR puede marcar [completed] → [archived] desde Seguimiento
```

Vista worker: Canvas en modo `View` (read-only).

### Escenario 2: Documento con firma — Flujo feliz

```
HR crea documento (requiresSignature=true)
  → HR envía a Worker
    → [Clon: sent]
      → Worker abre → [Clon: viewed]
        → Worker firma → [Clon: signed]
          → HR marca completado → [Clon: completed]
            → HR archiva → [Clon: archived]
```

Vista worker: Canvas en modo `Sign`. Solo puede arrastrar firma al canvas.

### Escenario 3: Worker tiene observación / reclamo

```
HR crea y envía documento
  → [Clon: sent]
    → Worker abre → [Clon: viewed]
      → Worker escribe observación (comment)
        → [Clon: in_review] (auto-transición al crear comment)
          → HR ve el doc en "Requiere atención" (dashboard) o tab "En revisión" (seguimiento)
            → HR responde en conversación del panel lateral
              → HR click "Marcar resuelto" → [Clon: viewed]
                → Worker firma → [signed] → ...
```

### Escenario 4: Worker rechaza el documento

```
HR envía documento
  → [Clon: sent]
    → Worker abre → [viewed]
      → Worker rechaza → [rejected]
        → HR ve en "Requiere atención" (dashboard)
          → HR click "Archivar" en panel lateral → [archived]
```

### Escenario 5: Envío masivo (mismo documento a N workers)

```
HR abre SendDocumentPanel desde /hr/documents
  → Selecciona N workers (los ya enviados aparecen deshabilitados)
  → Click "Enviar a N trabajadores"
    → Se ejecuta sendDocument mutation N veces (1 clon por worker)
      → Clon A (receiverId=A) → ciclo independiente
      → Clon B (receiverId=B) → ciclo independiente
      → Clon C (receiverId=C) → ciclo independiente
```

Cada clon tiene su propio estado, sus propios comments, su propia firma. El original no se toca. En `/hr/documents`, el original muestra "Enviado N veces".

### Escenario 6: Documento desde plantilla

```
HR abre /hr/documents/new
  → Selecciona plantilla desde sidebar Templates en el canvas
    → Canvas se carga con el contentJson de la plantilla
      → HR edita, personaliza
        → HR guarda como draft → Envía a workers → clones...
```

---

## Dónde vive cada cosa

| Qué | Dónde | Por qué |
|-----|-------|---------|
| Originales (sin `originalDocumentId`) | `/hr/documents` | Son la "biblioteca" de contenido de HR |
| Clones (con `originalDocumentId`) | `/hr/tracking` | Son la operación diaria, cada uno con su ciclo |
| Docs que requieren atención (`in_review`, `rejected`) | `/hr` dashboard | Vista rápida con deep-link a `/hr/tracking?doc=<id>` |
| Envío de documentos | `SendDocumentPanel` en `/hr/documents` | Es una acción sobre un original, no una sección |
| Conversaciones / observaciones | Panel lateral en `/hr/tracking` | Vinculadas al clon específico, no al original |

---

## Base de Datos — Tablas relevantes

### document

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text PK | nanoid |
| title | text | Nombre del documento |
| contentJson | json | Contenido Fabric.js (array de páginas) |
| status | enum | draft, sent, viewed, in_review, signed, rejected, completed, archived |
| requiresSignature | boolean | Si necesita firma del worker |
| senderId | text FK → user | HR que creó/envió |
| receiverId | text FK → user | Worker asignado (null en originales) |
| originalDocumentId | text FK → document | Referencia al original (null en originales) |
| templateId | text FK → template | Plantilla de origen (opcional) |
| isDeleted | boolean | Soft delete |

### comment

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text PK | nanoid |
| content | text | Contenido del mensaje |
| documentId | text FK → document | Documento (clon) asociado |
| authorId | text FK → user | Quién escribió (worker o HR) |
