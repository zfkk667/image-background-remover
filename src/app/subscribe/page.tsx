'use client'

/**
 * Subscription Page
 * Handles plan upgrades via PayPal Monthly Subscription
 * Prices in USD only
 */

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Plan configuration (USD only)
const plans = [
  { 
    id: 'basic', 
    name: 'Basic', 
    description: 'For light users',
    monthly_quota: 25, 
    price_usd: 9.99, 
    features: ['25 images/month', 'Priority processing', 'Batch processing', 'PNG/JPG/WebP'],
  },
  { 
    id: 'pro', 
    name: 'Pro', 
    description: 'For designers and e-commerce',
    monthly_quota: 60, 
    price_usd: 19.99, 
    features: ['60 images/month', 'Priority processing', 'Batch processing', 'API access', 'PNG/JPG/WebP'],
  },
]

async function getSession() {
  try {
    const res = await fetch('/api/auth/session')
    const data = await res.json()
    return data.authenticated ? data.user : null
  } catch {
    return null
  }
}

async function handleSubscribe(planId: string, setLoading: (v: boolean) => void) {
  setLoading(true)
  try {
    const user = await getSession()
    if (!user) {
      alert('Please sign in first to subscribe.')
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
      alert('Unable to connect to PayPal. Please try again later.')
    }
  } catch (error) {
    console.error('Subscription error:', error)
    alert('Subscription creation failed. Please try again.')
  }
  setLoading(false)
}

function SubscribeContent() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') || 'pro'
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan)
  const [loading, setLoading] = useState(false)

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <span className="text-xl font-bold text-gray-900">AI Background Remover</span>
              <p className="text-xs text-gray-500">One-click intelligent background removal</p>
            </div>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to {selectedPlan.name}</h1>
          <p className="text-gray-600">{selectedPlan.description} · {selectedPlan.monthly_quota} images/month</p>
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
              {plan.name} · ${plan.price_usd}/month
            </button>
          ))}
        </div>

        {/* Selected Plan Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
              <p className="text-gray-500">{selectedPlan.monthly_quota} images/month</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">${selectedPlan.price_usd}</div>
              <p className="text-gray-500">/month</p>
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
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            
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
                    Connecting to PayPal...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🅿️</span>
                    <span>Subscribe with PayPal</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Secure PayPal payment · Cancel anytime from your PayPal account
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Secure PayPal Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔄</span>
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📧</span>
            <span>Confirmation email within 24h</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">FAQ</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">How do I cancel my subscription?</summary>
              <p className="mt-2 text-gray-500">You can cancel anytime from your PayPal account. After cancellation, you can still use your credits until the end of the current billing cycle.</p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">What if I run out of credits?</summary>
              <p className="mt-2 text-gray-500">You can purchase additional credits from your Dashboard, or wait for the next billing cycle to reset your quota.</p>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-700">What image formats are supported?</summary>
              <p className="mt-2 text-gray-500">JPG, PNG, and WebP formats are supported. Max file size is 10MB per image.</p>
            </details>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link href="/pricing" className="text-blue-600 hover:underline">
            ← Back to Pricing
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; 2026 AI Background Remover. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <SubscribeContent />
    </Suspense>
  )
}
