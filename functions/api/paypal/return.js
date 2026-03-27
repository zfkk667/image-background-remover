/**
 * PayPal Return Handler
 * GET /api/paypal/return
 * 
 * For ONE-TIME PAYMENT returns: ?token=XXX&PayerID=XXX&paymentId=XXX
 * For SUBSCRIPTION returns: ?subscription_id=XXX&status=active
 * 
 * Verifies payment and adds credits directly (backup if webhook fails)
 */

export async function onRequestGet(context) {
  const { request, env } = context
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE } = env
  const API_BASE = PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'
  const CLIENT_ID = PAYPAL_CLIENT_ID
  const CLIENT_SECRET = PAYPAL_CLIENT_SECRET
  
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  
  // For one-time payment: token and PayerID
  const token = url.searchParams.get('token')
  const payerId = url.searchParams.get('PayerID')
  
  // For subscription: subscription_id
  const subscriptionId = url.searchParams.get('subscription_id')

  // Get access token for API calls
  const getAccessToken = async () => {
    const authResponse = await fetch(`${API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    })
    
    if (!authResponse.ok) return null
    const { access_token } = await authResponse.json()
    return access_token
  }

  // Process one-time payment (checkout order)
  const processOrder = async (orderId, accessToken) => {
    try {
      // Capture the order (complete the payment)
      const captureResponse = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      
      if (!captureResponse.ok) {
        console.error('Failed to capture order:', await captureResponse.text())
        return false
      }
      
      const order = await captureResponse.json()
      const purchaseUnit = order.purchase_units?.[0]
      
      if (purchaseUnit?.custom_id) {
        const { plan, credits, userId } = JSON.parse(purchaseUnit.custom_id)
        console.log(`Processing one-time payment: plan=${plan}, credits=${credits}, userId=${userId}`)
        
        if (userId && credits && env.DB) {
          const user = await env.DB.prepare(
            'SELECT * FROM users WHERE google_id = ?'
          ).bind(userId).first()
          
          if (user) {
            await env.DB.prepare(
              'UPDATE users SET quota_remaining = quota_remaining + ?, credits_purchased = credits_purchased + ? WHERE id = ?'
            ).bind(credits, credits, user.id).run()
            console.log(`Added ${credits} credits to user ${user.email}`)
            return true
          } else {
            console.log(`User not found for google_id ${userId}`)
          }
        }
      }
    } catch (e) {
      console.error('Error processing order:', e)
    }
    return false
  }

  // Process subscription activation
  const processSubscription = async (subId, accessToken) => {
    try {
      // Get subscription details
      const subResponse = await fetch(`${API_BASE}/v1/billing/subscriptions/${subId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      
      if (!subResponse.ok) {
        console.error('Failed to get subscription:', await subResponse.text())
        return false
      }
      
      const subscription = await subResponse.json()
      console.log('Processing subscription:', subscription)
      
      const customId = subscription.custom_id ? JSON.parse(subscription.custom_id) : null
      
      if (customId?.userId && customId?.credits && env.DB) {
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE google_id = ?'
        ).bind(customId.userId).first()
        
        if (user) {
          await env.DB.prepare(
            'UPDATE users SET quota_remaining = quota_remaining + ?, subscription_tier = ?, subscription_id = ?, subscription_status = ? WHERE id = ?'
          ).bind(
            customId.credits,
            customId.plan || 'basic',
            subId,
            'active',
            user.id
          ).run()
          console.log(`Activated subscription for user ${user.email}`)
          return true
        }
      }
    } catch (e) {
      console.error('Error processing subscription:', e)
    }
    return false
  }

  // Main logic
  if (status === 'success') {
    const accessToken = await getAccessToken()
    
    if (subscriptionId) {
      // Subscription return
      console.log('Subscription return, ID:', subscriptionId)
      await processSubscription(subscriptionId, accessToken)
    } else if (token) {
      // One-time payment return
      console.log('Order return, token:', token)
      await processOrder(token, accessToken)
    }
    
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/dashboard?payment=success' },
    })
    
  } else if (status === 'cancel') {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/pricing?payment=cancelled' },
    })
  } else {
    return new Response(null, {
      status: 302,
      headers: { 'Location': '/' },
    })
  }
}
