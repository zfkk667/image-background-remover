import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscribe - AI Background Remover',
  description: 'Subscribe to AI Background Remover monthly plans. Basic $9.99/month for 25 credits, Pro $19.99/month for 60 credits. Cancel anytime.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://image-bg-remover.shop/subscribe',
    siteName: 'AI Background Remover',
    title: 'Subscribe - AI Background Remover',
    description: 'Subscribe monthly plans for AI background removal. Basic $9.99/25 credits, Pro $19.99/60 credits.',
    images: [
      {
        url: 'https://image-bg-remover.shop/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Background Remover - Subscribe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subscribe - AI Background Remover',
    description: 'Subscribe monthly plans for AI background removal. Basic $9.99/25 credits, Pro $19.99/60 credits.',
    images: ['https://image-bg-remover.shop/og-image.png'],
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/subscribe',
  },
}

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
