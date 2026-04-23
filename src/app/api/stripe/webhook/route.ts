import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { create_key, update_key } from '@/lib/openrouter'
import { randomUUID } from 'crypto'

const sk = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let ev
  try {
    ev = stripe.webhooks.constructEvent(body, sig, sk)
  } catch (err: any) {
    return NextResponse.json({ err: err.message }, { status: 400 })
  }

  if (ev.type === 'checkout.session.completed') {
    const sess = ev.data.object as any
    const uid = sess.metadata.uid
    const amt = parseFloat(sess.metadata.amt)

    // Check idempotency
    const [existing] = await db.select().from(transactions).where(eq(transactions.stripeSessionId, sess.id))
    if (existing) return NextResponse.json({ ok: true, msg: 'Duplicate' })

    // Update DB
    const [w] = await db.select().from(wallets).where(eq(wallets.userId, uid))
    const nt = (w?.totalPurchased || 0) + amt

    let kh = w?.keyHash
    let kl = w?.keyLabel
    let kv = w?.keyValue

    if (!kh) {
      const ok = await create_key(`USER_${uid.slice(0, 8)}`, nt)
      kh = ok.hash
      kl = ok.label
      kv = ok.key // The secret
    } else {
      await update_key(kh, nt)
    }

    await db.update(wallets).set({
      totalPurchased: nt,
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
