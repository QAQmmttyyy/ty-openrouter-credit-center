import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wallets, transactions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { get_key } from '@/lib/openrouter'
import { CreditCard, Key, History } from 'lucide-react'

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
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your API credits and keys</p>
        </div>
        <div className="text-right">
          <span className="text-muted-foreground text-sm font-medium mr-2">Balance</span>
          <span className="text-4xl font-mono font-bold">${balance.toFixed(2)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-blue-500" />
            <h2 className="font-semibold">API Key</h2>
          </div>
          {w?.keyHash ? (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                {w.keyValue || w.keyLabel || '************'}
              </div>
              <p className="text-xs text-muted-foreground">
                Label: {w.keyLabel} <br/>
                Usage: ${usage.toFixed(4)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Top up to generate your API key.
            </p>
          )}
        </section>

        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-green-500" />
            <h2 className="font-semibold">Top Up</h2>
          </div>
          <div className="flex gap-2">
            {[10, 20, 50].map(amt => (
              <form key={amt} action="/api/topup" method="POST">
                <input type="hidden" name="amt" value={amt} />
                <button className="px-4 py-2 border rounded hover:bg-muted font-medium transition-colors">
                  ${amt}
                </button>
              </form>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-purple-500" />
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b">
            <tr>
              <th className="text-left pb-2">Date</th>
              <th className="text-left pb-2">Amount</th>
              <th className="text-left pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2">{t.createdAt.toLocaleDateString()}</td>
                <td className="py-2 font-mono">${t.amount.toFixed(2)}</td>
                <td className="py-2 capitalize">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
