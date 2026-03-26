/**
 * PayPal Webhook Handler
 * POST /api/paypal/webhook
 * Handles PayPal payment events (checkout, subscription, etc.)
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { PLATFORM_CLIENT_ID, PLATFORM_CLIENT_SECRET, PAYPAL_API_BASE, DB } = env

  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers)

    // Get PayPal access token for verification
    const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${PLATFORM_CLIENT_ID}:${PLATFORM_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!authResponse.ok) {
      console.error('PayPal auth failed')
      return new Response('Unauthorized', { status: 401 })
    }

    const { access_token } = await authResponse.json()

    // Verify webhook signature (in production, you should verify this)
    // For now, we'll process the event directly

    const event = JSON.parse(body)
    console.log('PayPal webhook event:', event.event_type)

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // One-time payment completed - add credits to user
        const purchaseUnit = event.resource?.purchase_units?.[0]
        if (purchaseUnit?.custom_id) {
          const { plan, credits } = JSON.parse(purchaseUnit.custom_id)
          const userId = event.resource?.custom_id || event.resource?.payer?.payer_id
          
          console.log(`Payment completed: ${plan}, credits: ${credits}, userId: ${userId}`)
          
          // If DB is available, add credits to user
          if (DB && userId) {
            await DB.prepare(
              'UPDATE users SET quota_remaining = quota_remaining + ? WHERE google_id = ?'
            ).bind(credits, userId).run()
          }
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.REACTIVATED': {
        // Subscription started/reactivated - set up monthly quota
        const subscription = event.resource
        if (subscription?.custom_id) {
          const { plan, credits } = JSON.parse(subscription.custom_id)
          const subscriberId = subscription.subscriber?.payer_id
          
          console.log(`Subscription activated: ${plan}, credits: ${credits}, subscriberId: ${subscriberId}`)
          
          // Update user subscription status in DB
          if (DB && subscriberId) {
            await DB.prepare(
              'UPDATE users SET subscription_id = ?, subscription_plan = ?, quota_remaining = ?, subscription_status = ? WHERE google_id = ?'
            ).bind(subscription.id, plan, credits, 'active', subscriberId).run()
          }
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        // Subscription cancelled
        const subscription = event.resource
        console.log(`Subscription cancelled: ${subscription.id}`)
        
        if (DB) {
          await DB.prepare(
            'UPDATE users SET subscription_status = ? WHERE subscription_id = ?'
          ).bind('cancelled', subscription.id).run()
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        // Subscription suspended due to payment failure
        const subscription = event.resource
        console.log(`Subscription suspended: ${subscription.id}`)
        
        if (DB) {
          await DB.prepare(
            'UPDATE users SET subscription_status = ? WHERE subscription_id = ?'
          ).bind('suspended', subscription.id).run()
        }
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment for subscription
        const sale = event.resource
        console.log(`Recurring payment completed: ${sale.id}, amount: ${sale.amount?.value}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Error', { status: 500 })
  }
}
