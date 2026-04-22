import Stripe from 'stripe'

const sk = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(sk)

export async function create_checkout(uid: string, email: string, amt: number) {
  const sess = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'API Credits',
            description: `Top up ${amt} USD credits`,
          },
          unit_amount: Math.round(amt * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?status=cancel`,
    customer_email: email,
    metadata: { uid, amt: amt.toString() },
  })
  return sess
}

export { stripe }
