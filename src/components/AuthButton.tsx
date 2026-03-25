'use client'

import { signIn, signOut, useSession } from "next-auth/react"

export default function AuthButton() {
  const { data: session } = useSession()
  
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm">欢迎，{session.user?.email}</p>
        <button 
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          登出
        </button>
      </div>
    )
  }
  
  return (
    <button 
      onClick={() => signIn('google')}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      使用 Google 登录
    </button>
  )
}
