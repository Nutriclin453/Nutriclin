import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../globals.css";
import { SupabaseProvider } from "@/components/supabase-provider";
import { SidebarProvider } from "@/components/sidebar-context";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Antonio Feitoza CRN - Nutricionista Esportivo",
  description: "Sistema de gestão para nutricionistas esportivos",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body
        className={`${manrope.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        <SupabaseProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
