import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ApolloWrapper } from "@/lib/apollo-wrapper"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "Paperly",
  description: "Gestión documental con firma digital",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ApolloWrapper>
          <TooltipProvider>{children}</TooltipProvider>
        </ApolloWrapper>
        <Toaster richColors duration={3000} />
      </body>
    </html>
  )
}
