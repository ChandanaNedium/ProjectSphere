import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import Providers from "@/components/providers"

export const metadata: Metadata = {
  title: {
    default: "ProjectSphere — Discover. Learn. Collaborate. Innovate.",
    template: "%s | ProjectSphere",
  },
  description:
    "ProjectSphere is an AI-powered platform for discovering student projects, checking originality, finding collaborators, and driving academic innovation across institutions.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
