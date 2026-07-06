import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientSessionProvider from "./ClientSessionProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Logistics CRM',
  description: 'Multi-tenant logistics and freight CRM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  );
}
