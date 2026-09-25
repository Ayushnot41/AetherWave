import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AetherWeave — Climate Resilience for Everyone',
  description:
    'Privacy-preserving anticipatory climate-health-livelihood resilience with on-chain impact verification.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AetherWeave',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B5E3B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <ConnectivityWrapper>
          <CivicNavigation />
          <div className="flex-1 pb-20 md:pb-0">
            {children}
          </div>
        </ConnectivityWrapper>
      </body>
    </html>
  );
}

/**
 * Client-side wrapper that initializes connectivity monitoring
 * and shows the offline banner when needed.
 */
import { ConnectivityWrapper } from '@/components/layout/connectivity-wrapper';
import { CivicNavigation } from '@/components/layout/civic-navigation';
