/**
 * Subscription Page
 * Handles plan upgrades (PayPal integration coming soon)
 */

import Link from 'next/link'
import { Suspense } from 'react'

const plans = [
  { id: 'basic', name: '基础版', monthly_quota: 100, price_cny: 19, price_usd: 5, yearly_cny: 169, features: ['100张图片/月', '优先处理', '批量处理'] },
  { id: 'pro', name: '专业版', monthly_quota: 500, price_cny: 49, price_usd: 15, yearly_cny: 429, features: ['500张图片/月', '优先处理', '批量处理', 'API访问'] },
  { id: 'enterprise', name: '企业版', monthly_quota: 2000, price_cny: 149, price_usd: 50, yearly_cny: 1299, features: ['2000张图片/月', '优先处理', '无限批量', 'API访问', '团队管理', '专属客服'] },
]

function SubscribeContent() {
  const selectedPlan = 'pro'
  const plan = plans.find(p => p.id === selectedPlan) || plans[1]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI 背景移除</h1>
              <p className="text-xs text-gray-500">智能一键去除图片背景</p>
            </div>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            返回个人中心
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">升级到 {plan.name}</h1>
          <p className="text-gray-600">解锁更多额度，高效处理图片</p>
        </div>

        {/* Selected Plan */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-gray-500">{plan.monthly_quota} 张图片/月</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">¥{plan.price_cny}</div>
              <p className="text-gray-500">/月</p>
            </div>
          </div>

          <ul className="space-y-2 mb-8">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> {feature}
              </li>
            ))}
          </ul>

          {/* Payment Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">选择支付方式</h3>
            
            {/* Coming Soon Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-xl">🚧</span>
                <span className="font-medium">支付功能正在接入中</span>
              </div>
              <p className="text-amber-700 text-sm mt-1">
                PayPal 支付即将开通，请耐心等待。开通后我们会通过邮件通知您。
              </p>
            </div>

            {/* Payment Buttons (Disabled) */}
            <div className="grid md:grid-cols-2 gap-4">
              <button disabled className="py-3 px-6 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                🅿️ PayPal (即将支持)
              </button>
              <button disabled className="py-3 px-6 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                💳 信用卡 (即将支持)
              </button>
            </div>

            {/* Yearly Option */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">年付优惠</p>
                  <p className="text-sm text-blue-700">年付立省 ¥{(plan.price_cny * 12) - plan.yearly_cny}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">¥{plan.yearly_cny}</p>
                  <p className="text-sm text-blue-700">/年（≈¥{Math.round(plan.yearly_cny / 12)}/月）</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Plans */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">或选择其他套餐</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {plans.filter(p => p.id !== selectedPlan).map(p => (
              <Link 
                key={p.id}
                href={`/subscribe?plan=${p.id}`}
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.monthly_quota} 张/月</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">¥{p.price_cny}</p>
                    <p className="text-sm text-gray-500">/月</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/pricing" className="text-blue-600 hover:underline">
            ← 返回定价页面
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; 2026 AI 背景移除. 保留所有权利.
        </div>
      </footer>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SubscribeContent />
    </Suspense>
  )
}