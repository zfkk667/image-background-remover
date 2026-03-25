'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  sub: string
  email?: string
  name?: string
  picture?: string
}

interface Session {
  authenticated: boolean
  user?: User
}

interface SessionContextType {
  session: Session | null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

export default function Providers({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      setSession(data)
    } catch {
      setSession({ authenticated: false })
    } finally {
      setLoading(false)
    }
  }

  const signIn = () => {
    window.location.href = '/api/auth/callback/google'
  }

  const signOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setSession({ authenticated: false })
    window.location.reload()
  }

  return (
    <SessionContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}