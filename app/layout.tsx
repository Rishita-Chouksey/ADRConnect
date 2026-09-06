import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/lib/RoleContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ADRConnect — Hospital Pharmacovigilance Platform',
  description: 'Digital adverse drug reaction monitoring, batch traceability, and pharmacovigilance for IV fluids and injectable drugs.',
};

import NextAuthProvider from '@/components/NextAuthProvider';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col transition-colors duration-200">
        <NextAuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <RoleProvider>
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </main>
                <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">ADRConnect</span>
                      <span>&bull;</span>
                      <span>District Maternal Hospital Pharmacovigilance Unit</span>
                    </div>
                    <p>Aligned with Indian Pharmacovigilance Programme (PvPI) &amp; CDSCO Guidelines</p>
                  </div>
                </footer>
              </RoleProvider>
            </LanguageProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
