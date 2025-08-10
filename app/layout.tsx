// app/layout.tsx

import type { Metadata } from "next";
import { Noto_Sans_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthRehydrationProvider } from "./(dashboard)/components/AuthRehydrationProvider/AuthRehydrationProvider";

const noto = Noto_Sans_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard Votaciones 2025",
  description: "Dashboard Votaciones 2025",
   icons: {
    icon: "/favicon.png", // 🧠 Ruta relativa desde /public
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={noto.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {/* ✅ Este ya no va acá */}
          {/* <AuthRehydrationProvider /> */}
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
