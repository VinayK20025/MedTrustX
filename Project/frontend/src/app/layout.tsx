import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedTrustX — Digital Hospital Operating System',
  description: 'Zero-Trust SaaS DHOS for enterprise healthcare management. Secure, audit-ready, multi-tenant hospital platform.',
  keywords: ['DHOS', 'hospital', 'healthcare', 'zero trust', 'EHR', 'telemedicine', 'MedTrustX'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0A0F1E" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
