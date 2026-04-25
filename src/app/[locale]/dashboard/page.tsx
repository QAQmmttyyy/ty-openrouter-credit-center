import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { get_key } from '@/lib/openrouter'
import { DashboardContent } from '@/components/DashboardContent'

export default async function Dash({ params: { locale } }: { params: { locale: string } }) {
  const sess = await getServerSession(authOptions)
  if (!sess?.user) redirect(`/${locale}/auth/signin`)
  const uid = sess.user.id

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
      if (ork) {
        balance = ork.limit_remaining || 0
        usage = ork.usage || 0
      }
    } catch (err) {
      console.error('Initial fetch failed')
    }
  }

  const initialData = {
    balance,
    usage,
    wallet: w || null,
    transactions: txs.map(t => ({
      ...t,
      createdAt: t.createdAt.getTime()
    }))
  }

  return <DashboardContent initialData={initialData} />
}
