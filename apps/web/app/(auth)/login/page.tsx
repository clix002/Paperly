"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type LoginInput, loginSchema } from "@paperly/shared"
import { FileCheck2, FileText, Shield, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"

export default function LoginPage() {
  const router = useRouter()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    const result = await signIn.email(data)
    if (result.error) {
      toast.error(result.error.message ?? "Error al iniciar sesión")
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[32px_32px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="size-8 bg-white rounded-md flex items-center justify-center">
            <FileText className="size-4 text-zinc-950" />
          </div>
          <span className="font-bold text-xl tracking-tight">Paperly</span>
        </div>

        <div className="relative space-y-10">
          <div className="space-y-3">
            <p className="text-3xl font-semibold leading-snug">
              Documentos laborales,
              <br />
              firmados en segundos.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Crea, distribuye y firma contratos, acuerdos y comunicados desde un solo lugar.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              { icon: FileCheck2, label: "Firma digital con verificación de identidad" },
              { icon: Shield, label: "Documentos seguros y con trazabilidad completa" },
              { icon: Zap, label: "Flujo automático de aprobación y seguimiento" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-600">
          © 2026 Paperly · Gestión documental para RR.HH.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="size-7 bg-zinc-950 rounded-md flex items-center justify-center">
              <FileText className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-lg">Paperly</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes credenciales?{" "}
            <a
              href="/register"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Ver usuarios de prueba
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
