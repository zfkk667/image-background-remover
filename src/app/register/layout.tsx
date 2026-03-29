import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '注册 - AI图片背景移除',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/register',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
