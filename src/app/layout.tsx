import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: {
    default: 'AI图片背景移除 - 一键智能抠图去背景',
    template: '%s | AI图片背景移除',
  },
  description:
    '免费AI智能图片背景移除工具，5秒一键抠图去背景。支持PNG/JPG/WebP格式，批量处理最高20张。适用于电商产品图、人像证件照、设计素材，无需注册即可使用。',
  keywords: [
    '图片背景移除',
    'AI抠图',
    '去背景',
    '证件照',
    '产品图处理',
    'PNG去背景',
    '电商图片工具',
    'background remover',
    'remove background',
    'AI background removal',
  ],
  authors: [{ name: 'image-bg-remover.shop' }],
  creator: 'image-bg-remover.shop',
  publisher: 'image-bg-remover.shop',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://image-bg-remover.shop/',
    siteName: 'AI 图片背景移除',
    title: 'AI图片背景移除 - 一键智能抠图',
    description: '免费 AI 智能图片背景移除工具，支持批量处理，5秒完成。支持 PNG/JPG/WebP。',
    images: [
      {
        url: 'https://image-bg-remover.shop/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI 图片背景移除工具 - 一键去除图片背景',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 图片背景移除工具',
    description: '免费 AI 智能图片背景移除工具，支持批量处理，5秒完成。',
    images: ['https://image-bg-remover.shop/og-image.png'],
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-gray-50 min-h-screen">
        <Providers>{children}</Providers>

        {/* Organization + WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AI 图片背景移除',
              url: 'https://image-bg-remover.shop/',
              description: '免费 AI 智能图片背景移除工具，支持批量处理，5秒完成。',
              publisher: {
                '@type': 'Organization',
                name: 'image-bg-remover.shop',
                url: 'https://image-bg-remover.shop/',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://image-bg-remover.shop/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Software Application Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'AI 图片背景移除',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: '4.99',
                highPrice: '29.99',
                offerCount: '3',
              },
              description: 'AI 智能图片背景移除工具，支持批量处理。',
              url: 'https://image-bg-remover.shop/',
            }),
          }}
        />
      </body>
    </html>
  )
}
