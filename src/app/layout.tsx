import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image Background Remover',
  description: 'AI-powered image background removal tool',
  keywords: ['image', 'background', 'removal', 'ai', 'photoshop'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
