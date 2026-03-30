const API_URL = "http://localhost:3000"

const USERS = [
  // RR.HH.
  {
    name: "Ana García",
    email: "ana@paperly.com",
    password: "password123",
    role: "hr",
  },
  {
    name: "Carlos Mendoza",
    email: "carlos@paperly.com",
    password: "password123",
    role: "hr",
  },
  // Trabajadores
  {
    name: "María López",
    email: "maria@paperly.com",
    password: "password123",
    role: "worker",
  },
  {
    name: "Juan Pérez",
    email: "juan@paperly.com",
    password: "password123",
    role: "worker",
  },
  {
    name: "Sofía Ramírez",
    email: "sofia@paperly.com",
    password: "password123",
    role: "worker",
  },
]

// Helpers de objetos Fabric.js
function clip(width = 900, height = 1200) {
  return {
    type: "Rect",
    version: "6.0.0",
    originX: "left",
    originY: "top",
    left: 0,
    top: 0,
    width,
    height,
    fill: "white",
    stroke: null,
    strokeWidth: 0,
    selectable: false,
    hasControls: false,
    name: "clip",
    shadow: { color: "rgba(0,0,0,0.8)", blur: 5, offsetX: 0, offsetY: 0 },
  }
}

function textbox(text: string, opts: Record<string, unknown> = {}) {
  return {
    type: "Textbox",
    version: "6.0.0",
    originX: "center",
    originY: "center",
    width: 700,
    fill: "#1a1a1a",
    fontSize: 14,
    fontFamily: "Times New Roman",
    ...opts,
    text,
  }
}

function line(x1: number, y1: number, x2: number, _y2: number) {
  return {
    type: "Line",
    version: "6.0.0",
    originX: "center",
    originY: "center",
    left: (x1 + x2) / 2,
    top: y1,
    x1: -((x2 - x1) / 2),
    y1: 0,
    x2: (x2 - x1) / 2,
    y2: 0,
    stroke: "#333333",
    strokeWidth: 1,
    selectable: true,
  }
}

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
  fill: string,
  opts: Record<string, unknown> = {}
) {
  return {
    type: "Rect",
    version: "6.0.0",
    originX: "center",
    originY: "center",
    left,
    top,
    width,
    height,
    fill,
    stroke: null,
    strokeWidth: 0,
    ...opts,
  }
}

// --- Templates ---

const TEMPLATES = [
  {
    title: "Contrato de trabajo",
    description:
      "Plantilla estándar para contratos laborales con cláusulas básicas y espacio de firmas",
    contentJson: [
      {
        version: "6.0.0",
        objects: [
          clip(),
          // Barra decorativa superior
          rect(450, 30, 800, 8, "#1e3a5f"),
          // Título
          textbox("CONTRATO DE TRABAJO", {
            left: 450,
            top: 80,
            width: 700,
            fontSize: 28,
            fontWeight: "bold",
            fill: "#1e3a5f",
            textAlign: "center",
          }),
          // Subtítulo
          textbox("Modalidad: Tiempo completo", {
            left: 450,
            top: 120,
            width: 700,
            fontSize: 12,
            fill: "#666666",
            textAlign: "center",
          }),
          // Línea separadora
          line(100, 150, 800, 150),
          // Datos del empleador
          textbox("DATOS DEL EMPLEADOR", {
            left: 450,
            top: 190,
            width: 700,
            fontSize: 13,
            fontWeight: "bold",
            fill: "#1e3a5f",
          }),
          textbox(
            "Empresa: [NOMBRE_EMPRESA]\nRUC/NIT: [RUC]\nDirección: [DIRECCIÓN_EMPRESA]\nRepresentante legal: [REPRESENTANTE]",
            {
              left: 450,
              top: 250,
              width: 700,
              fontSize: 12,
              lineHeight: 1.6,
            }
          ),
          // Datos del trabajador
          textbox("DATOS DEL TRABAJADOR", {
            left: 450,
            top: 340,
            width: 700,
            fontSize: 13,
            fontWeight: "bold",
            fill: "#1e3a5f",
          }),
          textbox(
            "Nombre completo: [NOMBRE_TRABAJADOR]\nDNI/Cédula: [DNI]\nDirección: [DIRECCIÓN_TRABAJADOR]\nCargo: [CARGO]",
            {
              left: 450,
              top: 400,
              width: 700,
              fontSize: 12,
              lineHeight: 1.6,
            }
          ),
          // Línea separadora
          line(100, 460, 800, 460),
          // Cláusulas
          textbox("CLÁUSULAS", {
            left: 450,
            top: 490,
            width: 700,
            fontSize: 13,
            fontWeight: "bold",
            fill: "#1e3a5f",
          }),
          textbox(
            "PRIMERA — OBJETO: El trabajador se compromete a prestar sus servicios en el cargo de [CARGO], realizando las funciones que le sean asignadas.\n\n" +
              "SEGUNDA — DURACIÓN: El presente contrato tendrá vigencia desde [FECHA_INICIO] hasta [FECHA_FIN], pudiendo ser renovado por acuerdo mutuo.\n\n" +
              "TERCERA — REMUNERACIÓN: La empresa pagará al trabajador la suma de [SALARIO] mensual, pagaderos los días [DÍA_PAGO] de cada mes.\n\n" +
              "CUARTA — HORARIO: El trabajador cumplirá un horario de [HORA_ENTRADA] a [HORA_SALIDA], de lunes a viernes.\n\n" +
              "QUINTA — OBLIGACIONES: El trabajador se compromete a cumplir con el reglamento interno, guardar confidencialidad y desempeñar sus funciones con diligencia.",
            {
              left: 450,
              top: 680,
              width: 700,
              fontSize: 11,
              lineHeight: 1.5,
            }
          ),
          // Zona de firmas
          line(100, 950, 800, 950),
          textbox(
            "Lugar y fecha: _________________________, a _____ de _______________ de 20____",
            {
              left: 450,
              top: 980,
              width: 700,
              fontSize: 11,
            }
          ),
          // Firma empleador
          line(180, 1090, 400, 1090),
          textbox("Firma del Empleador", {
            left: 290,
            top: 1110,
            width: 220,
            fontSize: 10,
            textAlign: "center",
            fill: "#666666",
          }),
          textbox("[REPRESENTANTE]", {
            left: 290,
            top: 1130,
            width: 220,
            fontSize: 10,
            textAlign: "center",
            fill: "#999999",
          }),
          // Firma trabajador
          line(500, 1090, 720, 1090),
          textbox("Firma del Trabajador", {
            left: 610,
            top: 1110,
            width: 220,
            fontSize: 10,
            textAlign: "center",
            fill: "#666666",
          }),
          textbox("[NOMBRE_TRABAJADOR]", {
            left: 610,
            top: 1130,
            width: 220,
            fontSize: 10,
            textAlign: "center",
            fill: "#999999",
          }),
          // Barra decorativa inferior
          rect(450, 1175, 800, 4, "#1e3a5f"),
        ],
      },
    ],
  },
  {
    title: "Acta de entrega de equipos",
    description:
      "Registro de entrega de equipos y herramientas al trabajador con inventario detallado",
    contentJson: [
      {
        version: "6.0.0",
        objects: [
          clip(),
          // Barra lateral decorativa
          rect(35, 600, 6, 1140, "#2d6a4f"),
          // Título
          textbox("ACTA DE ENTREGA DE EQUIPOS", {
            left: 470,
            top: 70,
            width: 700,
            fontSize: 26,
            fontWeight: "bold",
            fill: "#2d6a4f",
            textAlign: "center",
          }),
          // Subtítulo
          textbox("Inventario de bienes asignados al trabajador", {
            left: 470,
            top: 105,
            width: 700,
            fontSize: 12,
            fill: "#666666",
            textAlign: "center",
          }),
          // Línea separadora
          line(80, 135, 820, 135),
          // Info general
          rect(450, 200, 740, 100, "#f0fdf4", { rx: 6, ry: 6, stroke: "#2d6a4f", strokeWidth: 1 }),
          textbox(
            "Fecha: [FECHA]                                          N° de acta: [N_ACTA]\nTrabajador: [NOMBRE_TRABAJADOR]                    DNI: [DNI]\nCargo: [CARGO]                                              Área: [ÁREA]",
            {
              left: 450,
              top: 200,
              width: 700,
              fontSize: 11,
              lineHeight: 1.8,
            }
          ),
          // Tabla de equipos - encabezado
          rect(450, 290, 740, 30, "#2d6a4f"),
          textbox(
            "N°       Descripción del equipo              Serie / Código              Estado",
            {
              left: 450,
              top: 290,
              width: 700,
              fontSize: 11,
              fontWeight: "bold",
              fill: "#ffffff",
            }
          ),
          // Filas de la tabla
          textbox(
            "1.       [EQUIPO_1]                                    [SERIE_1]                       Nuevo\n\n" +
              "2.       [EQUIPO_2]                                    [SERIE_2]                       Nuevo\n\n" +
              "3.       [EQUIPO_3]                                    [SERIE_3]                       Nuevo\n\n" +
              "4.       [EQUIPO_4]                                    [SERIE_4]                       Nuevo\n\n" +
              "5.       [EQUIPO_5]                                    [SERIE_5]                       Nuevo",
            {
              left: 450,
              top: 400,
              width: 700,
              fontSize: 11,
              lineHeight: 1.4,
            }
          ),
          // Línea separadora
          line(80, 510, 820, 510),
          // Observaciones
          textbox("OBSERVACIONES", {
            left: 470,
            top: 545,
            width: 700,
            fontSize: 13,
            fontWeight: "bold",
            fill: "#2d6a4f",
          }),
          rect(450, 620, 740, 100, "#fafafa", { rx: 4, ry: 4, stroke: "#cccccc", strokeWidth: 1 }),
          textbox(
            "[Escribir observaciones sobre el estado de los equipos, condiciones especiales, accesorios incluidos, etc.]",
            {
              left: 450,
              top: 620,
              width: 700,
              fontSize: 11,
              fill: "#999999",
              fontStyle: "italic",
            }
          ),
          // Compromiso
          textbox("COMPROMISO DEL TRABAJADOR", {
            left: 470,
            top: 710,
            width: 700,
            fontSize: 13,
            fontWeight: "bold",
            fill: "#2d6a4f",
          }),
          textbox(
            "El trabajador declara haber recibido los equipos detallados en esta acta y se compromete a:\n\n" +
              "• Utilizar los equipos exclusivamente para fines laborales.\n" +
              "• Mantenerlos en buen estado de conservación y funcionamiento.\n" +
              "• Reportar cualquier daño, pérdida o mal funcionamiento de manera inmediata.\n" +
              "• Devolver los equipos al término de la relación laboral o cuando le sea requerido.",
            {
              left: 450,
              top: 810,
              width: 700,
              fontSize: 11,
              lineHeight: 1.5,
            }
          ),
          // Zona de firmas
          line(80, 920, 820, 920),
          textbox(
            "Lugar y fecha: _________________________, a _____ de _______________ de 20____",
            {
              left: 450,
              top: 950,
              width: 700,
              fontSize: 11,
            }
          ),
          // Firma quien entrega
          line(130, 1060, 380, 1060),
          textbox("Entrega", {
            left: 255,
            top: 1080,
            width: 250,
            fontSize: 10,
            textAlign: "center",
            fill: "#666666",
          }),
          textbox("[NOMBRE_RESPONSABLE]", {
            left: 255,
            top: 1100,
            width: 250,
            fontSize: 10,
            textAlign: "center",
            fill: "#999999",
          }),
          textbox("Área de TI / Logística", {
            left: 255,
            top: 1118,
            width: 250,
            fontSize: 9,
            textAlign: "center",
            fill: "#999999",
          }),
          // Firma quien recibe
          line(520, 1060, 770, 1060),
          textbox("Recibe", {
            left: 645,
            top: 1080,
            width: 250,
            fontSize: 10,
            textAlign: "center",
            fill: "#666666",
          }),
          textbox("[NOMBRE_TRABAJADOR]", {
            left: 645,
            top: 1100,
            width: 250,
            fontSize: 10,
            textAlign: "center",
            fill: "#999999",
          }),
          textbox("[CARGO]", {
            left: 645,
            top: 1118,
            width: 250,
            fontSize: 9,
            textAlign: "center",
            fill: "#999999",
          }),
          // Barra decorativa inferior
          rect(450, 1175, 800, 4, "#2d6a4f"),
        ],
      },
    ],
  },
]

// --- Seed functions ---

async function seedUser(user: (typeof USERS)[number]) {
  const res = await fetch(`${API_URL}/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? res.statusText
    console.log(`  ✗ ${user.email} (${user.role}) — ${msg}`)
    return
  }

  console.log(`  ✓ ${user.email} (${user.role})`)
}

async function getHrSession(): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ana@paperly.com", password: "password123" }),
  })

  const cookies = res.headers.getSetCookie()
  const sessionCookie = cookies.find((c) => c.startsWith("better-auth.session_token="))
  if (!sessionCookie) return null
  return sessionCookie.split(";")[0] ?? null
}

async function seedTemplates(cookie: string) {
  for (const tmpl of TEMPLATES) {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        query: `mutation CreateTemplate($input: CreateTemplateInput!) {
          createTemplate(input: $input) { id title }
        }`,
        variables: {
          input: {
            title: tmpl.title,
            description: tmpl.description,
            contentJson: tmpl.contentJson,
            status: "published",
          },
        },
      }),
    })

    const data = (await res.json()) as {
      data?: { createTemplate?: { title: string } }
      errors?: { message: string }[]
    }

    if (data.errors?.length) {
      console.log(`  ✗ ${tmpl.title} — ${data.errors[0]?.message}`)
    } else {
      console.log(`  ✓ ${data.data?.createTemplate?.title}`)
    }
  }
}

async function main() {
  console.log("Seeding usuarios...\n")
  for (const user of USERS) {
    await seedUser(user)
  }

  console.log("\nSeeding templates...\n")
  const cookie = await getHrSession()
  if (!cookie) {
    console.log("  ✗ No se pudo obtener sesión HR para crear templates")
  } else {
    await seedTemplates(cookie)
  }

  console.log("\nSeed completado.")
}

main()
