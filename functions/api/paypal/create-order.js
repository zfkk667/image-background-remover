/**
 * PayPal Create Order API - One-time Credit Purchase
 * POST /api/paypal/create-order
 * Body: { plan: 'starter' | 'popular' | 'pro_pack' }
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE } = env
  const API_BASE = PAYPAL_API_BASE || 'https://api-m.paypal.com' // Default to production
  const CLIENT_ID = PAYPAL_CLIENT_ID
  const CLIENT_SECRET = PAYPAL_CLIENT_SECRET

  try {
    const body = await request.json()
    const { plan, userId } = body
    
    // userId can be passed from frontend or from session cookie fallback
    let finalUserId = userId
    if (!finalUserId) {
      const cookieHeader = request.headers.get('Cookie') || ''
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [key, ...val] = c.trim().split('=')
          return [key, val.join('=')]
        })
      )
      const sessionCookie = cookies['session']
      if (sessionCookie) {
        try {
          const sessionData = JSON.parse(atob(sessionCookie))
          if (sessionData.exp > Date.now()) {
            finalUserId = sessionData.sub
          }
        } catch (e) {
          console.log('Failed to parse session:', e)
        }
      }
    }

    // Plan pricing configuration
    const plans = {
      starter: { amount: '4.99', credits: 10, description: 'Starter - 10 Credits' },
      popular: { amount: '12.99', credits: 30, description: 'Popular - 30 Credits' },
      pro_pack: { amount: '29.99', credits: 80, description: 'Pro Pack - 80 Credits' },
    }

    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get PayPal access token
    const authResponse = await fetch(`${API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!authResponse.ok) {
      const error = await authResponse.text()
      console.error('PayPal auth error:', error)
      return new Response(JSON.stringify({ error: 'PayPal authentication failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { access_token } = await authResponse.json()

    // Create PayPal order
    const orderResponse = await fetch(`${API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: selectedPlan.description,
            amount: {
              currency_code: 'USD',
              value: selectedPlan.amount,
            },
            custom_id: JSON.stringify({ plan, credits: selectedPlan.credits, userId: finalUserId }),
          },
        ],
        application_context: {
          brand_name: 'AI Background Remover',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${new URL(request.url).origin}/api/paypal/return?status=success`,
          cancel_url: `${new URL(request.url).origin}/api/paypal/return?status=cancel`,
        },
      }),
    })

    if (!orderResponse.ok) {
      const error = await orderResponse.text()
      console.error('PayPal order creation error:', error)
      return new Response(JSON.stringify({ error: 'Failed to create PayPal order' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const order = await orderResponse.json()

    // Find the approval URL from links
    const approvalUrl = order.links?.find(link => link.rel === 'approve')?.href

    return new Response(JSON.stringify({
      orderID: order.id,
      status: order.status,
      approvalUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Create order error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
