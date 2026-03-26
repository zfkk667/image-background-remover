/**
 * Quota API - 获取用户额度信息
 */

async function getUserFromSession(request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/session=([^;]+)/)
  
  if (!match) return null
  
  try {
    return JSON.parse(atob(match[1]))
  } catch {
    return null
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  
  const user = await getUserFromSession(request)
  
  if (!user) {
    return new Response(JSON.stringify({ 
      authenticated: false,
      quota: 0,
      used: 0,
      remaining: 0
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  if (!env.DB) {
    return new Response(JSON.stringify({ 
      authenticated: true,
      user: user,
      quota: null,
      error: 'Database not configured'
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  // 获取用户额度信息
  const userRecord = await env.DB.prepare(
    'SELECT quota_remaining FROM users WHERE google_id = ?'
  ).bind(user.sub).first()
  
  const remaining = userRecord?.quota_remaining || 0
  
  // 获取使用记录
  const usageRecords = await env.DB.prepare(
    'SELECT COUNT(*) as total_usage FROM usage_records WHERE user_id = ?'
  ).bind(user.sub).first()
  
  const totalUsed = usageRecords?.total_usage || 0
  
  return new Response(JSON.stringify({
    authenticated: true,
    user: {
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    quota: {
      remaining: remaining,
      used: totalUsed,
      total: remaining + totalUsed,
    }
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}