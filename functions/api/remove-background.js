/**
 * Remove Background API
 * Supports both free credits and purchased credits
 */

export async function onRequestPost(context) {
  const { request, env } = context
  
  const REMOVEBG_API_KEY = env.REMOVEBG_API_KEY || 'a6nJq58bzE1guyFGRjaao9P6'
  
  try {
    // 获取 session cookie
    const cookie = request.headers.get('cookie') || ''
    const sessionMatch = cookie.match(/session=([^;]+)/)
    
    if (!sessionMatch) {
      return new Response(JSON.stringify({ 
        error: 'Please sign in first',
        code: 'NOT_LOGGED_IN' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // 解码 session 获取用户ID
    let session
    try {
      session = JSON.parse(atob(sessionMatch[1]))
    } catch {
      return new Response(JSON.stringify({ 
        error: 'Session expired, please sign in again',
        code: 'INVALID_SESSION' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // 检查额度
    if (env.DB && session.sub) {
      const user = await env.DB.prepare(
        'SELECT * FROM users WHERE google_id = ?'
      ).bind(session.sub).first()
      
      if (!user) {
        return new Response(JSON.stringify({ 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      // 计算总可用额度 = 免费额度(quota_remaining) + 购买积分(credits_purchased)
      const totalQuota = (user.quota_remaining || 0) + (user.credits_purchased || 0)
      
      if (totalQuota <= 0) {
        return new Response(JSON.stringify({ 
          error: 'No credits remaining. Please purchase credits to continue.',
          code: 'QUOTA_EXCEEDED',
          quota_remaining: 0
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      // 处理文件
      const formData = await request.formData()
      const file = formData.get('file')
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Unsupported format. Please upload JPG, PNG or WebP.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      if (file.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      // 调用 remove.bg API
      const apiFormData = new FormData()
      apiFormData.append('image_file', file)
      apiFormData.append('size', 'auto')
      
      const res = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVEBG_API_KEY },
        body: apiFormData,
      })
      
      if (!res.ok) {
        const err = await res.text()
        return new Response(JSON.stringify({ error: `remove.bg error: ${err}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      // 扣减额度 - 优先扣减免费额度，再扣减购买积分
      let newQuotaRemaining = user.quota_remaining
      let newCreditsPurchased = user.credits_purchased
      
      if (newQuotaRemaining > 0) {
        newQuotaRemaining -= 1
      } else if (newCreditsPurchased > 0) {
        newCreditsPurchased -= 1
      }
      
      await env.DB.prepare(
        'UPDATE users SET quota_remaining = ?, credits_purchased = ? WHERE google_id = ?'
      ).bind(newQuotaRemaining, newCreditsPurchased, session.sub).run()
      
      // 记录使用
      await env.DB.prepare(
        'INSERT INTO usage_records (user_id, image_name, credits_used) VALUES (?, ?, ?)'
      ).bind(session.sub, file.name || 'unknown', 1).run()
      
      const resultBuffer = await res.arrayBuffer()
      const newTotalQuota = newQuotaRemaining + newCreditsPurchased
      
      return new Response(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="removed-bg.png"',
          'X-Quota-Remaining': String(newTotalQuota),
        },
      })
    }
    
    // 如果没有 DB，直接处理
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const apiFormData = new FormData()
    apiFormData.append('image_file', file)
    apiFormData.append('size', 'auto')
    
    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': REMOVEBG_API_KEY },
      body: apiFormData,
    })
    
    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: `remove.bg error: ${err}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    const resultBuffer = await res.arrayBuffer()
    
    return new Response(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="removed-bg.png"',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Processing failed: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}