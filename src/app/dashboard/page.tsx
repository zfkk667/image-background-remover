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