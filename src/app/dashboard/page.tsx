'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  sub: string
  name?: string
  email?: string
  picture?: string
}

interface Session {
  authenticated: boolean
  user?: User
  quota?: {
    total: number
    free_remaining: number
    credits_purchased: number
    subscription_tier: string | null
    subscription_status: string | null
  }
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session?.authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Background Remover</h1>
            </div>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
            ← Back to home
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-2 ml-4"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.picture ? (
                <img src={user.picture} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-gray-400">👤</span>
              )}
            </div>
            
            {/* User Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {user?.name || user?.email || 'User'}
              </h2>
              {user?.email && (
                <p className="text-gray-500 text-sm truncate">{user.email}</p>
              )}
            </div>

            {/* Credits Info */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm text-gray-500">Credits remaining</div>
              <div className="text-2xl font-bold text-blue-600">
                {session.quota?.total ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {session.quota?.subscription_tier && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">🌟 {session.quota.subscription_tier === 'basic' ? 'Basic' : 'Pro'} Subscription</h3>
                <p className="text-purple-100 text-sm">
                  {session.quota.subscription_status === 'active' ? '✓ Active' : session.quota.subscription_status === 'cancelled' ? '✗ Cancelled' : 'Status: ' + (session.quota.subscription_status || 'Unknown')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Monthly Credits</div>
                <div className="text-2xl font-bold">
                  {session.quota.subscription_tier === 'basic' ? '25' : '60'}/mo
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credits Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{session.quota?.free_remaining ?? 0}</div>
            <div className="text-sm text-gray-500">Free Credits</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{session.quota?.credits_purchased ?? 0}</div>
            <div className="text-sm text-gray-500">Purchased Credits</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{session.quota?.total ?? 0}</div>
            <div className="text-sm text-gray-500">Total Credits</div>
          </div>
        </div>

        {/* Usage Records Table - Placeholder */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Usage History</h3>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium uppercase">
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">File Size</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Credits Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No usage history yet. Start by removing background from an image.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ✂️ Remove Background
          </Link>
        </div>
      </main>
    </div>
  )
}