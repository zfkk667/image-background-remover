import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '定价计划 - 积分购买与月度订阅',
  description: 'AI图片背景移除定价：积分购买永久有效，月度订阅更划算。Starter 5积分$4.99，Popular 20积分$14.99，Pro Pack 60积分$39.99。月度订阅Basic $9.99/25次，Pro $19.99/60次。',
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
