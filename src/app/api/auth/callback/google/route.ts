import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const runtime = 'edge'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!

const secretKey = new TextEncoder().encode(NEXTAUTH_SECRET)

// 生成随机 state
function generateState(): string {
  return crypto.randomUUID()
}

// 生成 PKCE challenge
async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = crypto.randomUUID() + crypto.randomUUID()
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  // 使用 Buffer 或手动转换
  const hashArray = Array.from(new Uint8Array(hash))
  const challenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return { verifier, challenge }
}

// GET: 启动 OAuth 流程或处理回调
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // 处理错误
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, NEXTAUTH_URL))
  }

  // 处理回调
  if (code && state) {
    try {
      // 从 cookie 获取 verifier
      const cookieStore = req.cookies
      const storedState = cookieStore.get('oauth_state')?.value
      const verifier = cookieStore.get('oauth_verifier')?.value

      if (state !== storedState) {
        return NextResponse.redirect(new URL('/?error=state_mismatch', NEXTAUTH_URL))
      }

      // 交换 code 获取 token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/google`,
          grant_type: 'authorization_code',
          code_verifier: verifier || '',
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens)
        return NextResponse.redirect(new URL('/?error=token_exchange_failed', NEXTAUTH_URL))
      }

      // 获取用户信息
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const user = await userResponse.json()

      // 创建 JWT session
      const token = await new SignJWT({
        sub: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey)

      // 设置 cookie 并重定向
      const response = NextResponse.redirect(new URL('/', NEXTAUTH_URL))
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      // 清除临时 cookies
      response.cookies.delete('oauth_state')
      response.cookies.delete('oauth_verifier')

      return response
    } catch (err) {
      console.error('OAuth callback error:', err)
      return NextResponse.redirect(new URL('/?error=callback_error', NEXTAUTH_URL))
    }
  }

  // 启动 OAuth 流程
  const { verifier, challenge } = await generatePKCE()
  const newState = generateState()

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', `${NEXTAUTH_URL}/api/auth/callback/google`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', newState)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  const response = NextResponse.redirect(authUrl.toString())

  // 存储 state 和 verifier 到 cookie
  response.cookies.set('oauth_state', newState, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })
  response.cookies.set('oauth_verifier', verifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return response
}

// POST: 验证 session
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const { payload } = await jwtVerify(token, secretKey)

    return NextResponse.json({
      authenticated: true,
      user: payload,
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

// DELETE: 登出
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}