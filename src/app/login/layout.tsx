import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录 - AI图片背景移除',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
