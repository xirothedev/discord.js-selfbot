import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { Provider } from '@/components/provider';
import { appName, appVersion, siteUrl } from '@/lib/shared';
import './global.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

const description =
  'A Bun-first, TypeScript selfbot library with a discord.js v14-compatible API, voice, calls, recording, and a fake Discord test server.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} ${appVersion}`,
    template: `%s — ${appName}`,
  },
  description,
  applicationName: appName,
  keywords: ['discord.js', 'selfbot', 'discord', 'typescript', 'bun', 'voice', 'recording'],
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: appName,
    title: `${appName} ${appVersion}`,
    description,
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} ${appVersion}`,
    description,
    images: [`${siteUrl}/opengraph-image`],
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
