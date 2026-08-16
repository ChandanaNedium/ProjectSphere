import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ProjectSphere — Discover. Learn. Collaborate. Innovate.",
    template: "%s | ProjectSphere",
  },
  description:
    "ProjectSphere is an AI-powered platform for discovering student projects, checking originality, finding collaborators, and driving academic innovation across institutions.",
  keywords: ["student projects", "project discovery", "collaboration", "AI", "plagiarism check", "innovation"],
  openGraph: {
    title: "ProjectSphere",
    description: "Turn Student Projects Into a Connected Knowledge Ecosystem",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
