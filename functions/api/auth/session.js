/**
 * Session API - Get user session with quota info
 */

export async function onRequestGet(context) {
  const { request, env } = context
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/session=([^;]+)/)
  
  if (!match) {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  try {
    const session = JSON.parse(atob(match[1]))
    
    if (session.exp < Date.now()) {
      return new Response(JSON.stringify({ authenticated: false, reason: 'expired' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // 获取用户额度信息和订阅状态 (使用 google_id 查询)
    let quotaInfo = {
      total: 0,
      free_remaining: 0,
      credits_purchased: 0,
      subscription_tier: null,
      subscription_status: null,
    }
    
    if (env.DB && session.sub) {
      try {
        const user = await env.DB.prepare(
          'SELECT quota_remaining, credits_purchased, subscription_tier, subscription_status FROM users WHERE google_id = ?'
        ).bind(session.sub).first()
        
        if (user) {
          quotaInfo = {
            total: (user.quota_remaining || 0) + (user.credits_purchased || 0),
            free_remaining: user.quota_remaining || 0,
            credits_purchased: user.credits_purchased || 0,
            subscription_tier: user.subscription_tier || null,
            subscription_status: user.subscription_status || null,
          }
        }
      } catch (e) {
        console.error('Failed to get quota:', e)
      }
    }
    
    return new Response(JSON.stringify({ 
      authenticated: true, 
      user: {
        sub: session.sub,
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
      quota: quotaInfo
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function onRequestDelete(context) {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  })
}