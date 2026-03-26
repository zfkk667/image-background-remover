'use client'

/**
 * Pricing Page - Credits + Monthly Subscription
 * Credits: Starter, Popular, Pro Pack
 * Subscriptions: Basic, Pro
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Pricing - AI Background Remover',
  description: 'Flexible pricing: buy credits or subscribe monthly.',
}

// Load PayPal SDK
const loadPayPalScript = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="paypal.com"]')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
    document.head.appendChild(script)
  })
}

// Create order handler
const createOrder = async (plan: string): Promise<string> => {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data.orderID
}

// Create subscription handler
const createSubscription = async (plan: string): Promise<string> => {
  const response = await fetch('/api/paypal/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  // Redirect to PayPal approval URL
  if (data.approvalUrl) {
    window.location.href = data.approvalUrl
  }
  return data.subscriptionId
}

export default function PricingPage() {
  const basicContainerRef = useRef<HTMLDivElement>(null)
  const proContainerRef = useRef<HTMLDivElement>(null)
  const starterContainerRef = useRef<HTMLDivElement>(null)
  const popularContainerRef = useRef<HTMLDivElement>(null)
  const proPackContainerRef = useRef<HTMLDivElement>(null)
  const paypalLoadedRef = useRef(false)

  useEffect(() => {
    // Get PayPal client ID from environment
    const clientId = (window as any).NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID'

    loadPayPalScript(clientId)
      .then(() => {
        if (typeof window !== 'undefined' && (window as any).paypal) {
          const paypal = (window as any).paypal

          // Render subscription buttons (Basic & Pro)
          if (basicContainerRef.current && !basicContainerRef.current.querySelector('.paypal-button')) {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'subscribe' },
              createSubscription: (data: any, actions: any) => {
                return actions.subscription.create({
                  plan_id: 'PAYPAL_BASIC_MONTHLY', // Replace with actual PayPal plan ID
                })
              },
              onApprove: (data: any, actions: any) => {
                console.log('Basic subscription approved:', data)
                window.location.href = '/dashboard?payment=success'
              },
              onError: (err: any) => {
                console.error('PayPal Basic error:', err)
                // Fallback: use our API
                createSubscription('basic').catch(console.error)
              },
            }).render(basicContainerRef.current)
          }

          if (proContainerRef.current && !proContainerRef.current.querySelector('.paypal-button')) {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'subscribe' },
              createSubscription: (data: any, actions: any) => {
                return actions.subscription.create({
                  plan_id: 'PAYPAL_PRO_MONTHLY', // Replace with actual PayPal plan ID
                })
              },
              onApprove: (data: any, actions: any) => {
                console.log('Pro subscription approved:', data)
                window.location.href = '/dashboard?payment=success'
              },
              onError: (err: any) => {
                console.error('PayPal Pro error:', err)
                createSubscription('pro').catch(console.error)
              },
            }).render(proContainerRef.current)
          }

          // Render one-time purchase buttons (Credits)
          if (starterContainerRef.current && !starterContainerRef.current.querySelector('.paypal-button')) {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'gold', shape: 'rect' },
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    description: 'Starter - 10 Credits',
                    amount: { value: '4.99' },
                    custom_id: JSON.stringify({ plan: 'starter', credits: 10 }),
                  }],
                })
              },
              onApprove: (data: any, actions: any) => {
                console.log('Starter order approved:', data)
                window.location.href = '/dashboard?payment=success'
              },
              onError: (err: any) => {
                console.error('PayPal Starter error:', err)
                createOrder('starter').catch(console.error)
              },
            }).render(starterContainerRef.current)
          }

          if (popularContainerRef.current && !popularContainerRef.current.querySelector('.paypal-button')) {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'gold', shape: 'rect' },
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    description: 'Popular - 30 Credits',
                    amount: { value: '12.99' },
                    custom_id: JSON.stringify({ plan: 'popular', credits: 30 }),
                  }],
                })
              },
              onApprove: (data: any, actions: any) => {
                console.log('Popular order approved:', data)
                window.location.href = '/dashboard?payment=success'
              },
              onError: (err: any) => {
                console.error('PayPal Popular error:', err)
                createOrder('popular').catch(console.error)
              },
            }).render(popularContainerRef.current)
          }

          if (proPackContainerRef.current && !proPackContainerRef.current.querySelector('.paypal-button')) {
            paypal.Buttons({
              style: { layout: 'vertical', color: 'gold', shape: 'rect' },
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    description: 'Pro Pack - 80 Credits',
                    amount: { value: '29.99' },
                    custom_id: JSON.stringify({ plan: 'pro_pack', credits: 80 }),
                  }],
                })
              },
              onApprove: (data: any, actions: any) => {
                console.log('Pro Pack order approved:', data)
                window.location.href = '/dashboard?payment=success'
              },
              onError: (err: any) => {
                console.error('PayPal Pro Pack error:', err)
                createOrder('pro_pack').catch(console.error)
              },
            }).render(proPackContainerRef.current)
          }

          paypalLoadedRef.current = true
        }
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK:', err)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Background Remover</h1>
              <p className="text-xs text-gray-500">One-click intelligent background removal</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">💰 Pricing</Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Flexible Pricing That Scales With You</h1>
          <p className="text-xl text-blue-100 mb-2">Buy credits once, use them forever — or subscribe monthly for more</p>
          <p className="text-blue-200">Credits never expire. Subscriptions include monthly quota. Both are risk-free.</p>
        </div>
      </section>

      {/* Monthly Subscription Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📅 Monthly Subscriptions</h2>
            <p className="text-gray-600">Perfect for regular users. Get a set number of processings every month.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Basic - Monthly */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200 hover:border-blue-400 transition">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-blue-600">$9.99<span className="text-lg font-normal text-gray-500">/mo</span></div>
                <p className="text-gray-500 mt-1">billed monthly</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-700">25</span>
                  <span className="text-blue-700">credits/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">$0.40 per image</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 25 image processings/month
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Credits reset monthly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> High quality output
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PNG/JPG/WebP download
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Cancel anytime
                </li>
              </ul>
              
              <div ref={basicContainerRef} className="paypal-button-container">
                {/* PayPal button will be rendered here */}
              </div>
            </div>

            {/* Pro - Monthly */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-purple-500 text-white text-sm font-bold px-4 py-1 rounded-full">Best Value</span>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-purple-600">$19.99<span className="text-lg font-normal text-gray-500">/mo</span></div>
                <p className="text-gray-500 mt-1">billed monthly</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                  <span className="text-2xl font-bold text-purple-700">60</span>
                  <span className="text-purple-700">credits/month</span>
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium">Save 60% vs Basic</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 60 image processings/month
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Credits reset monthly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> High quality output
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PNG/JPG/WebP download
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Cancel anytime
                </li>
              </ul>
              
              <div ref={proContainerRef} className="paypal-button-container">
                {/* PayPal button will be rendered here */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits Section Header */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">💎 Or Buy Credits (One-Time)</h2>
          <p className="text-gray-600">Credits never expire. Pay once, use forever.</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Starter - 10 Credits */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-300 transition">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🪙</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900">$4.99</div>
                <p className="text-gray-500 mt-1">one-time payment</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-2xl font-bold text-gray-900">10</span>
                  <span className="text-gray-600">credits</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">$0.50 per image</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 10 image processings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> High quality output
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PNG/JPG/WebP download
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No subscription required
                </li>
              </ul>
              
              <div ref={starterContainerRef} className="paypal-button-container">
                {/* PayPal button will be rendered here */}
              </div>
            </div>

            {/* Popular - 30 Credits */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">Best Value</span>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Popular</h3>
                <div className="text-4xl font-bold text-blue-600">$12.99</div>
                <p className="text-gray-500 mt-1">one-time payment</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                  <span className="text-2xl font-bold text-blue-700">30</span>
                  <span className="text-blue-700">credits</span>
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium">Save 13% vs Starter</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 30 image processings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> High quality output
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PNG/JPG/WebP download
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No subscription required
                </li>
              </ul>
              
              <div ref={popularContainerRef} className="paypal-button-container">
                {/* PayPal button will be rendered here */}
              </div>
            </div>

            {/* Pro Pack - 80 Credits */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-purple-300 transition">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💎</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Pack</h3>
                <div className="text-4xl font-bold text-gray-900">$29.99</div>
                <p className="text-gray-500 mt-1">one-time payment</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                  <span className="text-2xl font-bold text-purple-700">80</span>
                  <span className="text-purple-700">credits</span>
                </div>
                <p className="text-sm text-purple-600 mt-2 font-medium">Save 25% vs Starter</p>
              </div>
              
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 80 image processings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> High quality output
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> PNG/JPG/WebP download
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> No subscription required
                </li>
              </ul>
              
              <div ref={proPackContainerRef} className="paypal-button-container">
                {/* PayPal button will be rendered here */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-bold mb-2">Buy Credits or Subscribe</h3>
              <p className="text-gray-600 text-sm">Choose a package that fits your needs. Pay once for credits, or subscribe monthly for more savings.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-bold mb-2">Upload Images</h3>
              <p className="text-gray-600 text-sm">Drag and drop your images. We process them instantly.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-bold mb-2">Download Results</h3>
              <p className="text-gray-600 text-sm">Get your background-removed images in high quality PNG format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                How do monthly subscriptions work?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                Monthly subscriptions give you a set number of credits that reset every month. For example, the Basic plan provides 25 credits on the 1st of each month. Unused credits do not roll over to the next month. You can cancel anytime.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                Do credits expire?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                Purchased credits never expire. Buy once, use whenever you need. They're yours forever. Note: Monthly subscription credits reset each month and do not roll over.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                Can I buy more credits later?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                Yes! You can purchase additional credits anytime. They will be added to your existing balance.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                What payment methods do you accept?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                We accept PayPal and all major credit cards (Visa, MasterCard, American Express). All payments are processed securely through PayPal.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                What image formats are supported?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                We support JPEG, PNG, and WebP input formats. All outputs are provided in high quality PNG format. Maximum file size is 10MB per image.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                Can I get a refund?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                Due to the nature of digital products, we cannot offer refunds once credits have been purchased. Please review your plan before purchasing.
              </p>
            </details>

            <details className="group border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-gray-900">
                How do I cancel my subscription?
                <span className="ml-2 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="p-4 text-gray-600 border-t border-gray-100">
                You can cancel your subscription anytime from your Dashboard. Your remaining credits will still be usable until the end of your billing period. We don't provide refunds for partially unused periods.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 AI Background Remover. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
