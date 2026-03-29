import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '定价计划 - 灵活付费方案',
  description: '灵活的AI图片背景移除定价方案。一次性购买积分永久使用，或订阅月度套餐获得更多额度。积分永不过期。',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://image-bg-remover.shop/pricing',
    siteName: 'AI 图片背景移除',
    title: '定价计划 | AI图片背景移除',
    description: '灵活的AI图片背景移除定价方案。积分永不过期，订阅月度套餐更划算。',
    images: [
      {
        url: 'https://image-bg-remover.shop/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI 图片背景移除 - 定价计划',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '定价计划 | AI图片背景移除',
    description: '灵活的AI图片背景移除定价方案。积分永不过期，订阅月度套餐更划算。',
    images: ['https://image-bg-remover.shop/og-image.png'],
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
