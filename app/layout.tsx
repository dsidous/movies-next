import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';

import { SiteHeader } from '@/components/layout/site-header';
import { NavigationLoadingOverlay } from '@/components/providers/navigation-loading-overlay';
import { QueryProvider } from '@/components/providers/query-provider';
import { SITE_NAME } from '@/lib/constants/site';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} — Movies & TV`,
  description: 'Discover popular movies, TV series, and people from TMDB.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <ClerkProvider>
          <QueryProvider>
            <SiteHeader />
            <NavigationLoadingOverlay />
            <main className="w-full max-w-full min-w-0 flex-1">{children}</main>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
