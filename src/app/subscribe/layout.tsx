import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '月度订阅 - AI图片背景移除',
  description: '订阅AI图片背景移除月度服务，每月获得固定处理额度。Basic套餐每月$9.99含25次处理，Pro套餐每月$19.99含60次处理。随时可取消，积分不浪费。',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://image-bg-remover.shop/subscribe',
    siteName: 'AI 图片背景移除',
    title: '订阅服务 | AI图片背景移除',
    description: '订阅月度服务，获得固定积分。Basic $9.99/25次，Pro $19.99/60次。随时取消。',
    images: [
      {
        url: 'https://image-bg-remover.shop/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI 图片背景移除 - 订阅服务',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '订阅服务 | AI图片背景移除',
    description: '订阅月度服务，获得固定积分。Basic $9.99/25次，Pro $19.99/60次。随时取消。',
    images: ['https://image-bg-remover.shop/og-image.png'],
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/subscribe',
  },
}

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
