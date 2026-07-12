import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientSessionProvider from "./ClientSessionProvider";

const inter = Inter({ subsets: ['latin'] });


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
