import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700"], // Bold weight only
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "Gêmeas Scarlatt - Conteúdo +18",
  description: "Vem conhecer nosso lado +18",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <head>
        <style>{`
html {
  font-family: ${montserrat.style.fontFamily};
  --font-montserrat: ${montserrat.variable};
}
        `}</style>
      </head>
      <body className="font-bold">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
