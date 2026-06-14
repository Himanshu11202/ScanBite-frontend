import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/site/Providers';

export const metadata: Metadata = {
  title: 'ScanBite — Restaurant QR Ordering',
  description: 'AI-powered QR menu and restaurant ordering platform for modern cafes and bars.',
  metadataBase: new URL('https://scanbite.example.com'),
  themeColor: '#000000'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
