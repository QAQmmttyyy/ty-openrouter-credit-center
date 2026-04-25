import Stripe from 'stripe'
import { calculateFees } from './fees'
import en from '../../messages/en.json'
import zh from '../../messages/zh.json'

const sk = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
const stripe = new Stripe(sk)

const messages = { en, zh }

export async function create_checkout(uid: string, email: string, amt: number, locale: 'en' | 'zh' = 'zh') {
  const { totalFee } = calculateFees(amt)
  const t = messages[locale].Stripe

  const sess = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    locale: locale,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: t.credits,
          },
          unit_amount: Math.round(amt * 100), // cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: t.fees,
          },
          unit_amount: Math.round(totalFee * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/${locale}/dashboard?status=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/${locale}/dashboard?status=cancel`,
    customer_email: email,
    metadata: { uid, amt: amt.toString() },
  })
  return sess
}

export { stripe }
