# UX/UI — Estructura Actual de Paperly

## Problema resuelto

HR necesita: crear documentos, enviarlos a N workers, y trackear qué pasó con cada uno.
Workers necesitan: ver qué les mandaron, firmar o reclamar, y ya.

---

## Navegación

### HR

```
Dashboard | Documentos | Seguimiento
```

| Sección | Qué muestra |
|---------|-------------|
| **Dashboard** (`/hr`) | Métricas (creados, enviados, pendientes, firmados, en revisión) + lista "Requiere atención" + accesos rápidos |
| **Documentos** (`/hr/documents`) | Solo originales (lo que HR creó). Tabs: Todos, Borradores, Con firma, Solo lectura |
| **Seguimiento** (`/hr/tracking`) | Solo clones enviados. Lista con filtros + vista kanban. Panel lateral con historial, conversación y acciones |

- **"Enviar"** es un botón visible en cards de borradores + opción en menú ⋮ → abre `SendDocumentPanel`
- **"Consultas"** se ven en Seguimiento — los docs `in_review` se atienden desde el panel lateral

### Worker

```
Mis documentos
```

Sin cambios. Vista simple con lista de documentos pendientes.

---

## Pantallas HR — Implementadas

### 1. Dashboard (`/hr`)

Layout 2 columnas: stats + atención (2/3) | acciones rápidas (1/3).

**Stats** — jerarquía visual:
- 2 stats primarios (cards grandes): Documentos creados, Total enviados
- 3 stats secundarios (cards compactos): Pendientes, Firmados, En revisión
- "En revisión" se resalta en rojo si count > 0

**Requiere atención** — lista de docs con status `in_review` o `rejected`. Cada item muestra título, receiver, status badge, y fecha relativa. Click → deep-link a `/hr/tracking?doc=<id>` (auto-selecciona el doc en el panel de detalle).

**Accesos rápidos** — card con lista compacta: Nuevo documento, Mis documentos, Seguimiento.

Saludo personalizado: "Hola, {firstName}".

**Componentes**: `StatsSection`, `StatCard`, `QuickActions`, `QuickActionItem`, `AttentionList`, `AttentionItem`, `AttentionEmpty`.

### 2. Documentos (`/hr/documents`)

Muestra **solo originales** (documentos sin `originalDocumentId`). Los clones viven en Seguimiento.

**Tabs con contadores**: Todos | Borradores | Con firma | Solo lectura

**Búsqueda** por título.

**Cada card muestra**:
- Ícono según tipo (FileSignature para firma, FileText para lectura)
- Título, fecha relativa
- "Enviado X veces" si tiene clones
- Badge tipo (Firma/Lectura) + badge status
- **Botón "Enviar"** visible directamente en cards de borradores (desktop)
- Menú ⋮: Editar, Enviar a trabajadores (solo draft), Eliminar

**Panel de envío** (`SendDocumentPanel`):
Al hacer click en "Enviar", la lista se comprime a la izquierda (420px) y un panel lateral ocupa el resto del viewport — mismo patrón que `/hr/tracking`. El panel incluye:
- Info del documento: status, tipo, fecha, veces enviado
- Selección de workers con búsqueda y "Seleccionar todos"
- Workers ya enviados se muestran deshabilitados con badge "Ya enviado"
- Campo de mensaje opcional
- Resumen: "Se crearán N copias independientes"
- Botones Cancelar + Enviar
- Cada envío llama `sendDocument` mutation (crea 1 clon por worker)

La lista comprimida muestra items simplificados (como tracking list items) y permite cambiar de documento directamente.

**Componentes**: `DocumentListHeader`, `CompactDocumentList`, `DocumentRow`, `EmptyState`, `SendDocumentPanel` (con `PanelHeader`, `DocumentInfoCard`, `WorkerSelection`, `WorkerList`, `WorkerCard`, `SendActionBar`).

### 3. Seguimiento (`/hr/tracking`)

Vista operativa de clones enviados. Toggle entre vista Lista y Kanban (con indicador activo en color primario). Soporta deep-link via `?doc=<id>` para auto-seleccionar un documento (usado desde "Requiere atención" en dashboard).

#### Vista Lista

**Tabs** (mismos `<Tabs variant="line">` que Documents): Todos | Pendientes | En revisión | Firmados | Completados. Siempre muestran count con badge.

**Búsqueda** por título o nombre de receiver.

Click en un doc → **panel lateral** con:
- Info del documento (título, receiver, fecha envío, status)
- **Timeline de estados** — progreso visual con step actual resaltado (`ring-1`), conectores sólidos para steps alcanzados
- **Acciones contextuales** — botones que cambian según el estado actual:

| Estado | Acciones |
|--------|----------|
| `sent` | Info: "Esperando apertura del trabajador" |
| `viewed` | Info: "El trabajador ha visto el documento" |
| `in_review` | Botón: "Marcar resuelto" → cambia a `viewed` |
| `signed` | Botón: "Marcar completado" → cambia a `completed` |
| `rejected` | Botón: "Archivar" → cambia a `archived` |
| `completed` | Botón: "Archivar" → cambia a `archived` |

- **Conversación** — historial de comments entre worker y HR. Input para responder.

Las acciones ejecutan la mutation `updateDocument` con el `DocumentStatus` enum correspondiente.

#### Vista Kanban

Columnas por estado: Enviados, Vistos, En revisión, Firmados, Completados, Archivados.

Cards muestran título, receiver, badge de comments si tiene. Click → mismo panel lateral. Columnas vacías muestran "Sin documentos".

Sin drag & drop (transiciones por acciones, no manuales).

**Componentes**: `TrackingHeader`, `ViewToggle`, `TrackingList`, `TrackingListItem`, `DetailPanel`, `DetailHeader`, `DetailInfo`, `StatusTimeline`, `ContextualActions`, `ConversationPanel`, `ConversationHeader`, `ConversationMessages`, `CommentBubble`, `ConversationInput`, `TrackingKanban`, `KanbanLane`, `LaneHeader`, `KanbanCard`.

---

## Pantallas Worker — Implementadas

### 1. Mis documentos (`/dashboard`)

Stats compactos: Pendientes, En revisión, Completados.

Lista agrupada por urgencia:
1. Pendientes (necesita acción del worker)
2. En revisión (esperando HR)
3. Completados

### 2. Ver documento (`/dashboard/documents/[id]`)

Canvas editor con modo según tipo:
- **Modo View** (solo lectura): canvas read-only
- **Modo Sign** (firma): sidebar con firma, solo puede arrastrar firma al canvas

Sidebar de observaciones: lista de comments existentes + input para crear nuevo. Al crear observación, el documento transiciona automáticamente a `in_review`.

### Editor (canvas)

- Auto-save con debounce de 500ms. Indicador visual en navbar: spinner + "Guardando..." mientras guarda, "Guardado" (verde) al completar.
- Botón "Volver" usa `router.back()` para respetar la navegación del usuario (no hardcoded a una ruta).
- Título editable inline (click para editar, Enter para confirmar, Escape para cancelar).
- Menú Archivo (HR): importar JSON, guardar como plantilla.
- Menú Exportar (HR): JSON, PNG, JPG, SVG, PDF (A4).

---

## Principios de Diseño Aplicados

### 1. Acciones contextuales, no botones fijos
Menú ⋮ muestra solo acciones válidas para el estado actual. En Seguimiento, las acciones del panel lateral cambian según el status del clon.

### 2. Panel lateral > página nueva
Detalles de documentos en Seguimiento se abren en panel lateral. El contexto de la lista se mantiene.

### 3. Separación clara original/clon
- **Documentos** = originales (biblioteca de contenido)
- **Seguimiento** = clones (operación diaria)
- No se mezclan nunca en la misma vista.

### 4. Estados con color consistente
Colores definidos en `DocumentStatusBadge`: azul (sent), ámbar (viewed), naranja (in_review), verde (signed), rojo (rejected), verde oscuro (completed), gris (archived).

### 5. Zero state útil
- Documentos vacío → "No hay documentos" + link "Crear primer documento"
- Búsqueda sin resultados → "No se encontraron documentos" + botón "Limpiar búsqueda"
- Atención vacía → "Todo en orden — sin documentos que requieran atención"

---

## Rutas

```
/hr                               ← Dashboard con métricas + atención
/hr/documents                     ← Lista de originales
/hr/documents/new                 ← Canvas: crear documento
/hr/documents/[id]/edit           ← Canvas: editar documento
/hr/tracking                      ← Seguimiento de clones (lista + kanban)

/dashboard                        ← Worker: mis documentos
/dashboard/documents/[id]         ← Worker: ver/firmar documento
```

---

## Flujo Completo — Un día típico de HR

```
1. Abre Paperly → Dashboard
   → Ve: 3 docs en revisión, 2 rechazados en "Requiere atención"
   → Click en un item → va a Seguimiento

2. Seguimiento → Tab "En revisión"
   → Click en "Contrato — Juan Pérez"
   → Panel lateral: ve la observación de Juan en conversación
   → Responde directamente en el chat
   → Click "Marcar resuelto" → status vuelve a viewed

3. Seguimiento → Tab "Firmados"
   → Click en "Acta — María López"
   → Click "Marcar completado" → pasa a completed

4. Vuelve a Documentos
   → Click [+ Nuevo] → abre canvas → crea documento
   → Guarda → vuelve a lista
   → Click botón "Enviar" en la card → panel lateral de selección de workers
   → Selecciona 3 workers → envía
   → Los 3 clones aparecen en Seguimiento como "Enviados"
```
