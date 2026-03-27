/**
 * PayPal Webhook Handler
 * POST /api/paypal/webhook
 * Handles PayPal payment events (checkout, subscription, etc.)
 */

export async function onRequestPost(context) {
  const { request, env } = context
  const { DB } = env

  try {
    const body = await request.json()
    console.log('PayPal webhook event:', body.event_type)

    switch (body.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // One-time payment completed - add credits to user
        const resource = body.resource
        const purchaseUnit = resource?.purchase_units?.[0]
        
        if (purchaseUnit?.custom_id) {
          const { plan, credits, userId } = JSON.parse(purchaseUnit.custom_id)
          
          console.log(`Payment completed: plan=${plan}, credits=${credits}, userId=${userId}`)
          
          if (DB && userId) {
            // Try to find user by google_id first
            const user = await DB.prepare(
              'SELECT * FROM users WHERE google_id = ?'
            ).bind(userId).first()
            
            // If found, add credits
            if (user) {
              await DB.prepare(
                'UPDATE users SET quota_remaining = quota_remaining + ? WHERE id = ?'
              ).bind(credits, user.id).run()
              console.log(`Added ${credits} credits to user ${user.email}`)
            } else {
              console.log(`User not found for google_id ${userId}`)
            }
          }
        }
        break
      }

      case 'CHECKOUT.ORDER.APPROVED': {
        console.log('Order approved, waiting for capture...')
        break
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.REACTIVATED': {
        const subscription = body.resource
        if (subscription?.custom_id) {
          const { plan, credits, userId } = JSON.parse(subscription.custom_id)
          const subscriberEmail = subscription.subscriber?.email_address
          
          console.log(`Subscription activated: plan=${plan}, credits=${credits}, userId=${userId}, email=${subscriberEmail}`)
          
          if (DB && userId) {
            // Try to find user by google_id (userId) first
            const user = await DB.prepare(
              'SELECT * FROM users WHERE google_id = ?'
            ).bind(userId).first()
            
            if (user) {
              await DB.prepare(
                'UPDATE users SET subscription_id = ?, subscription_plan = ?, quota_remaining = quota_remaining + ?, subscription_status = ? WHERE id = ?'
              ).bind(subscription.id, plan, credits, 'active', user.id).run()
              console.log(`Subscription activated for user ${user.email} (google_id: ${userId})`)
            } else {
              console.log(`User not found for google_id ${userId}, trying email...`)
              // Fallback: try to match by email
              if (subscriberEmail) {
                const userByEmail = await DB.prepare(
                  'SELECT * FROM users WHERE email = ?'
                ).bind(subscriberEmail).first()
                
                if (userByEmail) {
                  await DB.prepare(
                    'UPDATE users SET subscription_id = ?, subscription_plan = ?, quota_remaining = quota_remaining + ?, subscription_status = ? WHERE id = ?'
                  ).bind(subscription.id, plan, credits, 'active', userByEmail.id).run()
                  console.log(`Subscription activated for user ${userByEmail.email} (by email)`)
                }
              }
            }
          }
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscription = body.resource
        console.log(`Subscription cancelled: ${subscription.id}`)
        
        if (DB) {
          await DB.prepare(
            'UPDATE users SET subscription_status = ? WHERE subscription_id = ?'
          ).bind('cancelled', subscription.id).run()
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        const subscription = body.resource
        console.log(`Subscription payment failed: ${subscription.id}`)
        
        if (DB) {
          await DB.prepare(
            'UPDATE users SET subscription_status = ? WHERE subscription_id = ?'
          ).bind('payment_failed', subscription.id).run()
        }
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment completed - add credits for subscription cycle
        const sale = body.resource
        console.log(`Recurring payment completed: sale_id=${sale.id}, amount=${sale.amount?.total}`)
        
        if (DB && sale?.custom_id) {
          try {
            const { plan, credits, userId } = JSON.parse(sale.custom_id)
            if (userId) {
              const user = await DB.prepare(
                'SELECT * FROM users WHERE google_id = ?'
              ).bind(userId).first()
              
              if (user) {
                await DB.prepare(
                  'UPDATE users SET quota_remaining = quota_remaining + ? WHERE id = ?'
                ).bind(credits, user.id).run()
                console.log(`Added ${credits} credits for subscription renewal to user ${user.email}`)
              }
            }
          } catch (e) {
            console.log('Failed to parse custom_id from sale:', e)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${body.event_type}`)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Error', { status: 500 })
  }
}
