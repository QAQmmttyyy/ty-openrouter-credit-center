import Stripe from 'stripe'
import { calculateFees } from './fees'

const sk = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(sk)

export async function create_checkout(uid: string, email: string, amt: number) {
  const { totalFee } = calculateFees(amt)

  const sess = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Credits',
          },
          unit_amount: Math.round(amt * 100), // cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service & Platform Fees',
          },
          unit_amount: Math.round(totalFee * 100), // cents
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
