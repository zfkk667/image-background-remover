'use client'

/**
 * Subscription Page
 * Handles plan upgrades via PayPal Monthly Subscription
 * Integrates with /api/paypal/create-subscription backend
 */

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Plan configuration (matches backend PayPal plan IDs)
const plans = [
  { 
    id: 'basic', 
    name: '基础版', 
    description: '适合轻度使用',
    monthly_quota: 25, 
    price_usd: 9.99, 
    price_cny: 69,
    yearly_cny: 599,
    features: ['25张图片/月', '优先处理', '批量处理', '支持 PNG/JPG/WebP'],
    paypal_plan_id: 'P-0MS15850SN341105ENHCLINQ',
  },
  { 
    id: 'pro', 
    name: '专业版', 
    description: '适合设计师和电商',
    monthly_quota: 60, 
    price_usd: 19.99, 
    price_cny: 129,
    yearly_cny: 1099,
    features: ['60张图片/月', '优先处理', '批量处理', 'API访问', '支持 PNG/JPG/WebP'],
    paypal_plan_id: 'P-3EP04297XE993681DNHCLIPQ',
  },
]

// Get session user info
async function getSession() {
  try {
    const res = await fetch('/api/auth/session')
    const data = await res.json()
    return data.authenticated ? data.user : null
  } catch {
    return null
  }
}

// Create subscription via API and redirect to PayPal
async function handleSubscribe(planId: string, setLoading: (v: boolean) => void) {
  setLoading(true)
  try {
    const user = await getSession()
    if (!user) {
      alert('请先登录后再订阅')
      window.location.href = '/login'
      return
    }
    
    const response = await fetch('/api/paypal/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, userId: user.sub }),
    })
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create subscription')
    }
    
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl
    } else {
      alert('无法连接 PayPal，请稍后重试')
    }
  } catch (error) {
    console.error('Subscription error:', error)
    alert('订阅创建失败，请稍后重试')
  }
  setLoading(false)
}

function SubscribeContent() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') || 'pro'
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan)
  const [loading, setLoading] = useState(false)
  const [showYearly, setShowYearly] = useState(false)

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1]

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && plans.find(p => p.id === planParam)) {
      setSelectedPlanId(planParam)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <span className="text-xl font-bold text-gray-900">AI 背景移除</span>
              <p className="text-xs text-gray-500">智能一键去除图片背景</p>
            </div>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            返回个人中心
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">升级到 {selectedPlan.name}</h1>
          <p className="text-gray-600">{selectedPlan.description} · 每月 {selectedPlan.monthly_quota} 张图片</p>
        </div>

        {/* Plan Selection Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selectedPlanId === plan.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {plan.name} · ¥{plan.price_cny}/月
            </button>
          ))}
        </div>

        {/* Selected Plan Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
              <p className="text-gray-500">{selectedPlan.monthly_quota} 张图片/月</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">¥{selectedPlan.price_cny}</div>
              <p className="text-gray-500">/月</p>
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {selectedPlan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">✓</span> {feature}
              </li>
            ))}
          </ul>

          {/* Payment Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">选择支付方式</h3>
            
            {/* PayPal Button */}
            <div className="mb-4">
              <button
                onClick={() => handleSubscribe(selectedPlanId, setLoading)}
                disabled={loading}
                className="w-full py-4 px-6 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-lg font-medium transition flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    正在连接 PayPal...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🅿️</span>
                    <span>用 PayPal 订阅 {selectedPlan.name}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                PayPal 安全支付 · 随时可在 PayPal 中取消订阅
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">或</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Yearly Option */}
            <div 
              className={`p-4 rounded-lg border cursor-pointer transition ${
                showYearly 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-blue-300'
              }`}
              onClick={() => setShowYearly(!showYearly)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">年付优惠 🔥</p>
                  <p className="text-sm text-green-600">立省 ¥{(selectedPlan.price_cny * 12) - selectedPlan.yearly_cny}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">¥{selectedPlan.yearly_cny}</p>
                  <p className="text-sm text-gray-500">/年（≈¥{Math.round(selectedPlan.yearly_cny / 12)}/月）</p>
                </div>
              </div>
              
              {showYearly && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-3">
                    年付包含 12 个月月度额度 ({selectedPlan.monthly_quota} 张/月 × 12 = {selectedPlan.monthly_quota * 12} 张)
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      alert('年付订阅功能即将上线，请先选择月度订阅')
                    }}
                    className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition text-sm"
                  >
                    联系客服开通年付
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>PayPal 安全支付</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span>随时取消</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📧</span>
            <span>24h 内收到确认邮件</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">常见问题</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">订阅后如何取消？</summary>
              <p className="mt-2 text-gray-500">您可以随时在 PayPal 中取消订阅，取消后当前计费周期内仍可使用，下个周期不再扣费。</p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">额度用完怎么办？</summary>
              <p className="mt-2 text-gray-500">您可以在 Dashboard 中购买额外额度，或者等下个计费周期额度重置。</p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">支持哪些图片格式？</summary>
              <p className="mt-2 text-gray-500">支持 JPG、PNG、WebP 格式，单张图片最大 10MB。</p>
            </details>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
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
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">加载中...</div></div>}>
      <SubscribeContent />
    </Suspense>
  )
}
