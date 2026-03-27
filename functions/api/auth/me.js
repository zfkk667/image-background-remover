/**
 * Get Current User Info API
 * GET /api/auth/me
 * Returns user info based on session cookie
 */

export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    const cookieHeader = request.headers.get('Cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [key, ...val] = c.trim().split('=')
        return [key, val.join('=')]
      })
    )
    
    const sessionCookie = cookies['session']
    
    if (!sessionCookie) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    try {
      const sessionData = JSON.parse(atob(sessionCookie))
      
      // Check if session is expired
      if (sessionData.exp < Date.now()) {
        return new Response(JSON.stringify({ user: null, expired: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      
      return new Response(JSON.stringify({
        user: {
          sub: sessionData.sub,
          email: sessionData.email,
          name: sessionData.name,
          picture: sessionData.picture,
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Get user error:', error)
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
