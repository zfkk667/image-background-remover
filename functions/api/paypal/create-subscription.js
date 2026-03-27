/**
 * PayPal Create Subscription API - Monthly Subscription
 * POST /api/paypal/create-subscription
 * Body: { plan: 'basic' | 'pro', userId?: string }
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE } = env
  const API_BASE = PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'
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

    // Subscription plan configuration (PayPal Billing Plan IDs - use existing plans)
    const plans = {
      basic: {
        name: 'Basic Monthly Subscription',
        description: '25 credits per month',
        amount: '9.99',
        credits: 25,
        plan_id: 'P-0MS15850SN341105ENHCLINQ', // Basic $9.99/month
      },
      pro: {
        name: 'Pro Monthly Subscription',
        description: '60 credits per month',
        amount: '19.99',
        credits: 60,
        plan_id: 'P-3EP04297XE993681DNHCLIPQ', // Pro $19.99/month
      },
    }

    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      return new Response(JSON.stringify({ error: 'Invalid subscription plan' }), {
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

    // Use the existing billing plan directly
    const billingPlanId = selectedPlan.plan_id

    // Create subscription with existing plan
    const subscriptionResponse = await fetch(`${API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify({
        plan_id: billingPlanId,
        subscriber: {
          email_address: 'buyer@example.com',
        },
        custom_id: JSON.stringify({ plan, credits: selectedPlan.credits, userId: finalUserId }),
        application_context: {
          brand_name: 'AI Background Remover',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${new URL(request.url).origin}/api/paypal/return?status=success&type=subscription`,
          cancel_url: `${new URL(request.url).origin}/api/paypal/return?status=cancel&type=subscription`,
        },
      }),
    })

    if (!subscriptionResponse.ok) {
      const error = await subscriptionResponse.text()
      console.error('PayPal subscription creation error:', error)
      return new Response(JSON.stringify({ error: 'Failed to create subscription' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const subscription = await subscriptionResponse.json()

    // Find the approval URL
    const approvalUrl = subscription.links?.find(link => link.rel === 'approve')?.href

    return new Response(JSON.stringify({
      subscriptionId: subscription.id,
      approvalUrl,
      status: subscription.status,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Create subscription error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
