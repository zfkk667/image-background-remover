/**
 * Test DB Connection
 * GET /api/test-db
 */

export async function onRequestGet(context) {
  const { env } = context
  
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        error: 'DB binding is undefined',
        message: 'D1 database is not bound to this worker'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Try to query users
    const result = await env.DB.prepare('SELECT * FROM users LIMIT 5').all()
    
    return new Response(JSON.stringify({
      success: true,
      userCount: result.results.length,
      users: result.results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
