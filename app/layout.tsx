import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "L5M - Limit 5 Minutes",
  description: "Plataforma de compartilhamento de vídeos de até 5 minutos",
    generator: 'v0.dev'
}

export default function RootLayout({
  
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <link rel="icon" href="/icone5.png" type="image/png" />
      <body className={inter.className}>{children}</body>
    </html>
  )
}
