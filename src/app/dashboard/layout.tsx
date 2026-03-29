import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '控制台 - AI图片背景移除',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://image-bg-remover.shop/dashboard',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
