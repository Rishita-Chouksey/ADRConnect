import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { RoleProvider } from '@/lib/RoleContext';
import Navbar from '@/components/Navbar';
import NextAuthProvider from '@/components/NextAuthProvider';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import Footer from '@/components/Footer';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager / Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EP5QFBLTFK"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EP5QFBLTFK');
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col transition-colors duration-200">
        <NextAuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <RoleProvider>
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </main>
                <Footer />
              </RoleProvider>
            </LanguageProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
