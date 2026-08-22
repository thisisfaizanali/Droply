import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from './providers';
import { fontHeading, fontBody } from '@/config/fonts';

export const metadata: Metadata = {
  title: 'Droply',
  description: 'Secure cloud storage for your images, powered by ImageKit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${fontHeading.variable} ${fontBody.variable} antialiased bg-background text-foreground`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
