import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/lib/RoleContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'ADRConnect — Hospital Pharmacovigilance Platform',
  description: 'Digital adverse drug reaction monitoring, batch traceability, and pharmacovigilance for IV fluids and injectable drugs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <RoleProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-800">ADRConnect</span>
                <span>&bull;</span>
                <span>District Maternal Hospital Pharmacovigilance Unit</span>
              </div>
              <p>Aligned with Indian Pharmacovigilance Programme (PvPI) & CDSCO Guidelines</p>
            </div>
          </footer>
        </RoleProvider>
      </body>
    </html>
  );
}
