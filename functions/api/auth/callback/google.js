/**
 * Google OAuth Callback Handler
 * Creates user account with initial 3 credits quota
 */

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
  const REDIRECT_URI = env.REDIRECT_URI || 'https://image-bg-remover.shop/api/auth/callback/google'
  
  // 如果是回调（有 code 参数）
  if (code) {
    try {
      // 交换 code 获取 token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      
      const tokens = await tokenRes.json()
      
      if (!tokenRes.ok) {
        return Response.redirect(`${url.origin}/?error=${tokens.error || 'token_failed'}`)
      }
      
      // 获取用户信息
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const googleUser = await userRes.json()
      
      // 保存用户到 D1 数据库
      if (env.DB) {
        // 检查用户是否存在 (使用 google_id 查询)
        const existingUser = await env.DB.prepare(
          'SELECT * FROM users WHERE google_id = ?'
        ).bind(googleUser.sub).first()
        
        if (existingUser) {
          // 更新用户信息
          await env.DB.prepare(
            'UPDATE users SET name = ?, picture = ?, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?'
          ).bind(googleUser.name, googleUser.picture, googleUser.sub).run()
        } else {
          // 创建新用户，一次性赠送3次额度
          await env.DB.prepare(
            'INSERT INTO users (google_id, email, name, picture, quota_remaining) VALUES (?, ?, ?, ?, ?)'
          ).bind(googleUser.sub, googleUser.email, googleUser.name, googleUser.picture, 3).run()
        }
      }
      
      // 创建 session
      const sessionData = JSON.stringify({
        sub: googleUser.sub,  // 这是 google_id
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 天
      })
      const session = btoa(sessionData)
      
      // 重定向到首页并设置 cookie
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/?welcome=1`,
          'Set-Cookie': `session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      })
    } catch (error) {
      console.error('OAuth callback error:', error)
      return Response.redirect(`${url.origin}/?error=callback_error`)
    }
  }
  
  // 启动 OAuth 流程
  const state = crypto.randomUUID()
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid email profile')
  authUrl.searchParams.set('state', state)
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': authUrl.toString(),
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  })
}