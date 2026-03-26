/**
 * PayPal Create Order API - One-time Credit Purchase
 * POST /api/paypal/create-order
 * Body: { plan: 'starter' | 'popular' | 'pro_pack', credits: number }
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { PLATFORM_CLIENT_ID, PLATFORM_CLIENT_SECRET, PAYPAL_API_BASE } = env

  try {
    const body = await request.json()
    const { plan, credits } = body

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
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PLATFORM_CLIENT_ID}:${PLATFORM_CLIENT_SECRET}`)}`,
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
    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
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
            custom_id: JSON.stringify({ plan, credits: selectedPlan.credits }),
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

    return new Response(JSON.stringify({
      orderID: order.id,
      status: order.status,
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
