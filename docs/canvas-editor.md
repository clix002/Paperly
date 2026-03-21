# Canvas Editor — Modos y Matriz de Visibilidad

## Modos del Editor

El editor canvas tiene 4 modos que determinan qué herramientas, sidebars y acciones están disponibles.

| Modo | Quién lo usa | Cuándo se activa | Propósito |
|------|-------------|-------------------|-----------|
| **Create** | HR | `/hr/documents/new` | Crear documento desde cero o plantilla |
| **Document** | HR | `/hr/documents/[id]/edit` | Editar documento existente |
| **Sign** | Worker | `/dashboard/documents/[id]` con `requiresSignature=true` | Firmar documento |
| **View** | Worker | `/dashboard/documents/[id]` con `requiresSignature=false` | Solo lectura |

---

## Matriz de Visibilidad por Modo

### Navbar

| Elemento | Create | Document | Sign | View |
|----------|--------|----------|------|------|
| Botón volver (←) | ✅ | ✅ | ✅ | ✅ |
| Menú "Archivo" | ✅ | ✅ | ❌ | ❌ |
| ↳ Abrir JSON | ✅ | ✅ | ❌ | ❌ |
| ↳ Guardar como plantilla | ✅ | ❌ | ❌ | ❌ |
| Seleccionar (cursor) | ✅ | ✅ | ❌ | ❌ |
| Deshacer / Rehacer | ✅ | ✅ | ❌ | ❌ |
| Título (editable) | ✅ | ✅ | ❌ (solo lectura) | ❌ (solo lectura) |
| Menú "Exportar" | ✅ | ✅ | ❌ | ❌ |
| Acciones custom (slot) | ✅ | ✅ | ✅ (botón Firmar) | ✅ (botón Visto) |

### Sidebar Izquierda (Herramientas)

| Herramienta | Create | Document | Sign | View |
|-------------|--------|----------|------|------|
| Templates | ✅ | ❌ | ❌ | ❌ |
| Imagen | ✅ | ✅ | ❌ | ❌ |
| Texto | ✅ | ✅ | ❌ | ❌ |
| Figuras | ✅ | ✅ | ❌ | ❌ |
| Dibujar | ✅ | ✅ | ❌ | ❌ |
| Ajustes | ✅ | ✅ | ❌ | ❌ |
| Firmas | ❌ | ❌ | ✅ | ❌ |
| **Sidebar visible** | ✅ | ✅ | ✅ | ❌ |

### Sidebars de Edición (paneles expandibles)

| Sidebar | Create | Document | Sign | View |
|---------|--------|----------|------|------|
| ShapeSidebar | ✅ | ✅ | ❌ | ❌ |
| FillColorSidebar | ✅ | ✅ | ❌ | ❌ |
| StrokeColorSidebar | ✅ | ✅ | ❌ | ❌ |
| StrokeWidthSidebar | ✅ | ✅ | ❌ | ❌ |
| OpacitySidebar | ✅ | ✅ | ❌ | ❌ |
| TextSidebar | ✅ | ✅ | ❌ | ❌ |
| FontSidebar | ✅ | ✅ | ❌ | ❌ |
| ImageSidebar | ✅ | ✅ | ❌ | ❌ |
| TemplateSidebar | ✅ | ❌ | ❌ | ❌ |
| FilterSidebar | ✅ | ✅ | ❌ | ❌ |
| DrawSidebar | ✅ | ✅ | ❌ | ❌ |
| SettingsSidebar | ✅ | ✅ | ❌ | ❌ |
| SignatureSidebar | ❌ | ❌ | ✅ | ❌ |

### Canvas y Controles

| Elemento | Create | Document | Sign | View |
|----------|--------|----------|------|------|
| Toolbar (propiedades objeto) | ✅ | ✅ | ❌ | ❌ |
| Canvas interactivo | ✅ | ✅ | ✅ (solo firma) | ❌ (read-only) |
| Selección de objetos | ✅ | ✅ | ❌ | ❌ |
| Footer (zoom + páginas) | ✅ | ✅ | ✅ | ✅ |
| Auto-save (debounced) | ✅ | ✅ | ❌ | ❌ |

---

## Lógica de Control

```
isWorker = Sign || View
  → Oculta: navbar tools, file menu, export, toolbar, all HR sidebars
  → Oculta: auto-save callback

isEditableEditorType = Create || Document
  → Muestra: todas las herramientas HR

View mode adicional:
  → canvas.selection = false
  → Todos los objetos: selectable=false, evented=false
  → Cursores: default (no pointer/move)
```

---

## Arquitectura de Componentes

```
Editor (editor.tsx)
├── Navbar (navbar.tsx)
│   ├── Botón volver
│   ├── Menú Archivo        [!isWorker]
│   ├── Quick tools          [!isWorker]
│   ├── Título (editable)
│   ├── Actions slot         [siempre]
│   └── Menú Exportar        [!isWorker]
├── Sidebar (sidebar.tsx)    [!View]
│   ├── Templates button     [Create]
│   ├── Firmas button        [Sign]
│   └── HR tools             [!isWorker]
├── *Sidebars (12 paneles)   [!isWorker]
├── SignatureSidebar          [Sign]
├── Toolbar                   [!isWorker]
├── Canvas container
│   └── <canvas> (Fabric.js)
└── Footer (footer.tsx)
    ├── Páginas (popover)
    └── Zoom (−, %, +, ⛶)
```

---

## Zoom

- **Auto-zoom**: al iniciar y al resize, ajusta el documento al 85% del contenedor
- **Manual zoom** (botones +/−): expande el canvas más allá del contenedor, aparecen scrollbars nativos del navegador
- **Reset**: vuelve a auto-zoom (fit to container)
- Rango: 20% – 500%
- Paso: ±20% por click
- El fondo del canvas es gris (`#e5e5e5`), el documento es un rectángulo blanco con sombra
