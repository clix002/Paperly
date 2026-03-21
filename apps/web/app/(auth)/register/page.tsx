"use client"

import { ExternalLink, FileText, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const TEST_USERS = [
  { name: "Ana García", email: "ana@paperly.com", role: "hr", roleLabel: "RR.HH." },
  { name: "Carlos Ruiz", email: "carlos@paperly.com", role: "hr", roleLabel: "RR.HH." },
  { name: "María López", email: "maria@paperly.com", role: "worker", roleLabel: "Trabajador" },
  { name: "Juan Pérez", email: "juan@paperly.com", role: "worker", roleLabel: "Trabajador" },
  { name: "Sofía Ramírez", email: "sofia@paperly.com", role: "worker", roleLabel: "Trabajador" },
]

const PASSWORD = "password123"

function UserList() {
  return (
    <ul className="space-y-2">
      {TEST_USERS.map((u) => (
        <li
          key={u.email}
          className="flex items-center justify-between rounded-lg border px-3 py-2.5 bg-background"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="size-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium leading-none">{u.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
            </div>
          </div>
          <Badge variant={u.role === "hr" ? "default" : "secondary"} className="text-[10px]">
            {u.roleLabel}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="size-8 bg-white rounded-md flex items-center justify-center">
            <FileText className="size-4 text-zinc-950" />
          </div>
          <span className="font-bold text-xl tracking-tight">Paperly</span>
        </div>

        <div className="relative space-y-4">
          <p className="text-3xl font-semibold leading-snug">
            Todo listo para
            <br />
            que lo pruebes.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Creamos usuarios de prueba para que puedas explorar Paperly como RR.HH. y como
            trabajador sin necesidad de registrarte.
          </p>
        </div>

        <p className="relative text-xs text-zinc-600">
          © 2026 Paperly · Gestión documental para RR.HH.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="size-7 bg-zinc-950 rounded-md flex items-center justify-center">
              <FileText className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-lg">Paperly</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Usuarios de prueba</h1>
            <p className="text-sm text-muted-foreground">
              Para tu comodidad, ya creamos cuentas listas para usar.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Todos los usuarios tienen la misma contraseña:{" "}
              <code className="font-mono font-semibold text-foreground bg-muted px-1 py-0.5 rounded">
                {PASSWORD}
              </code>
            </p>
          </div>

          <UserList />

          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center rounded-md bg-zinc-950 text-white text-sm font-medium h-9 px-4 hover:bg-zinc-800 transition-colors"
            >
              Ir al login
            </Link>
            <a
              href="https://github.com/clix002/Paperly"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border text-sm font-medium h-9 px-4 hover:bg-muted transition-colors text-muted-foreground"
            >
              <ExternalLink className="size-3.5" />
              Ver repositorio en GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
