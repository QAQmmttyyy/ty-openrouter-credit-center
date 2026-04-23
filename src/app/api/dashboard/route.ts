import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { get_key } from '@/lib/openrouter'
import { NextResponse } from 'next/server'

export async function GET() {
  const sess = await getServerSession(authOptions)
  if (!sess?.user) return new Response('Unauthorized', { status: 401 })
  const uid = (sess.user as any).id

  const [w] = await db.select().from(wallets).where(eq(wallets.userId, uid))
  const txs = await db.select().from(transactions)
    .where(eq(transactions.userId, uid))
    .orderBy(desc(transactions.createdAt))
    .limit(10)

  let balance = 0
  let usage = 0
  if (w?.keyHash) {
    try {
      const ork = await get_key(w.keyHash)
      usage = ork.usage || 0
      balance = w.totalPurchased - usage
    } catch (err) {
      return NextResponse.json({
        balance: null,
        usage: null,
        wallet: w,
        transactions: txs,
        error: 'OR_SYNC_FAILED'
      })
    }
  } else if (w) {
    balance = w.totalPurchased
  }

  return NextResponse.json({
    balance,
    usage,
    wallet: w,
    transactions: txs
  })
}
