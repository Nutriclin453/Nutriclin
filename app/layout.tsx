import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { SupabaseProvider } from '@/components/supabase-provider';
import { SidebarProvider } from '@/components/sidebar-context';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Antonio Feitoza CRM - Nutricionista Esportivo',
  description: 'Sistema de gestão para nutricionistas esportivos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body
        className={`${manrope.variable} font-sans bg-[#0b1326] text-[#dae2fd] antialiased min-h-screen`}
        suppressHydrationWarning
      >
        <SupabaseProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
