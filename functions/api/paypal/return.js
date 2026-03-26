/**
 * PayPal Return Handler
 * GET /api/paypal/return?status=success&type=subscription
 * Redirects user back to site after PayPal payment
 */

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')

  if (status === 'success') {
    // Redirect to dashboard with success message
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/dashboard?payment=success',
      },
    })
  } else if (status === 'cancel') {
    // Redirect back to pricing with cancel message
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/pricing?payment=cancelled',
      },
    })
  } else {
    // Unknown status, redirect to home
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
      },
    })
  }
}
