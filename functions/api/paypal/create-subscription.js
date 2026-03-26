/**
 * PayPal Create Subscription API - Monthly Subscription
 * POST /api/paypal/create-subscription
 * Body: { plan: 'basic' | 'pro' }
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { PLATFORM_CLIENT_ID, PLATFORM_CLIENT_SECRET, PAYPAL_API_BASE } = env

  try {
    const body = await request.json()
    const { plan } = body

    // Subscription plan configuration
    const plans = {
      basic: {
        name: 'Basic Monthly Subscription',
        description: '25 credits per month',
        amount: '9.99',
        credits: 25,
        plan_id: 'PAYPAL_BASIC_MONTHLY',
      },
      pro: {
        name: 'Pro Monthly Subscription',
        description: '60 credits per month',
        amount: '19.99',
        credits: 60,
        plan_id: 'PAYPAL_PRO_MONTHLY',
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

    // First, create or get the billing plan
    const planResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `plan-${selectedPlan.plan_id}-${Date.now()}`,
      },
      body: JSON.stringify({
        product_id: 'PROD_BACKGROUND_REMOVER_MONTHLY',
        name: selectedPlan.name,
        description: selectedPlan.description,
        billing_cycles: [
          {
            frequency: {
              interval_unit: 'MONTH',
              interval_count: 1,
            },
            tenure_type: 'ACTIVE',
            sequence: 1,
            total_cycles: 0, // Infinite
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
        type: 'INFINITE',
      }),
    })

    let billingPlanId
    if (planResponse.status === 201) {
      const planData = await planResponse.json()
      billingPlanId = planData.id
    } else if (planResponse.status === 409) {
      // Plan already exists, need to find it
      const existingPlans = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans?product_id=PROD_BACKGROUND_REMOVER_MONTHLY`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      })
      const plansData = await existingPlans.json()
      billingPlanId = plansData.plans?.[0]?.id
      if (!billingPlanId) {
        console.error('Could not find existing plan')
        return new Response(JSON.stringify({ error: 'Failed to get billing plan' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else {
      const error = await planResponse.text()
      console.error('PayPal plan creation error:', error)
      return new Response(JSON.stringify({ error: 'Failed to create billing plan' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Activate the plan if not already active
    await fetch(`${PAYPAL_API_BASE}/v1/billing/plans/${billingPlanId}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    // Create subscription
    const subscriptionResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify({
        plan_id: billingPlanId,
        subscriber: {
          email_address: 'buyer@example.com', // Will be updated by PayPal
        },
        custom_id: JSON.stringify({ plan, credits: selectedPlan.credits }),
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
