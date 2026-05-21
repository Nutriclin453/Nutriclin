import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import { SupabaseProvider } from "@/components/supabase-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Antonio Feitoza - Triagem",
  description: "Formulário de triagem e captação",
};

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body
        className={`${manrope.variable} font-sans min-h-screen bg-slate-950 text-slate-100 antialiased`}
        suppressHydrationWarning
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
