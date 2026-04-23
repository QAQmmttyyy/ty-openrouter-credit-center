import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { get_key } from '@/lib/openrouter'
import { DashboardContent } from '@/components/DashboardContent'

export default async function Dash() {
  const sess = await getServerSession(authOptions)
  if (!sess?.user) redirect('/api/auth/signin')
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
      balance = w.totalPurchased
    }
  } else if (w) {
    balance = w.totalPurchased
  }

  const initialData = {
    balance,
    usage,
    wallet: w,
    transactions: txs
  }

  return <DashboardContent initialData={initialData} />
}
