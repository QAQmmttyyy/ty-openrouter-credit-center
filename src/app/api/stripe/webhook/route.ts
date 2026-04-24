import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { create_key, get_key, update_key } from '@/lib/openrouter'
import { randomUUID } from 'crypto'

const sk = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let ev
  try {
    ev = stripe.webhooks.constructEvent(body, sig, sk)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ err: msg }, { status: 400 })
  }

  if (ev.type === 'checkout.session.completed') {
    const sess = ev.data.object as unknown as { id: string, metadata: { uid: string, amt: string } }
    const uid = sess.metadata.uid
    const amt = parseFloat(sess.metadata.amt)

    // Check idempotency
    const [existing] = await db.select().from(transactions).where(eq(transactions.stripeSessionId, sess.id))
    if (existing) return NextResponse.json({ ok: true, msg: 'Duplicate' })

    // Update OpenRouter and DB
    const [w] = await db.select().from(wallets).where(eq(wallets.userId, uid))

    let kh = w?.keyHash
    let kl = w?.keyLabel
    let kv = w?.keyValue

    if (!kh) {
      // First key
      const ok = await create_key(`USER_${uid.slice(0, 8)}`, amt)
      kh = ok.hash
      kl = ok.label
      kv = ok.key
    } else {
      // Top up existing key: stateless increment using current balance
      const ork = await get_key(kh)
      const newLimit = (ork?.limit || 0) + amt
      await update_key(kh, { limit: newLimit })
    }

    await db.update(wallets).set({
      keyHash: kh,
      keyLabel: kl,
      keyValue: kv,
      updatedAt: new Date(),
    }).where(eq(wallets.userId, uid))

    await db.insert(transactions).values({
      id: randomUUID(),
      userId: uid,
      amount: amt,
      type: 'topup',
      status: 'completed',
      stripeSessionId: sess.id,
      createdAt: new Date(),
    })
  }

  return NextResponse.json({ ok: true })
}
