'use client'

import useSWR from 'swr'
import { CreditCard, Key, History, LogOut, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function DashboardContent({ initialData }: { initialData: any }) {
  const [mounted, setMounted] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const { data, error } = useSWR('/api/dashboard', fetcher, {
    fallbackData: initialData,
    refreshInterval: 5000,
  })

  const { balance = 0, usage = 0, wallet, transactions: txs = [], error: dataError } = data || {}

  const copyKey = () => {
    if (!wallet?.keyValue) return
    navigator.clipboard.writeText(wallet.keyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your API credits and keys</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-muted-foreground text-sm font-medium block">Balance</span>
            <span className="text-4xl font-mono font-bold">
              {(error || dataError) ? '---' : `$${Number(balance).toFixed(2)}`}
            </span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-blue-500" />
              <h2 className="font-semibold">API Key</h2>
            </div>
            {wallet?.keyHash && (
              <div className="flex gap-1">
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button 
                  onClick={copyKey}
                  className="p-1 hover:bg-muted rounded transition-colors text-blue-600"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
          {wallet?.keyHash ? (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded font-mono text-sm break-all relative min-h-[44px] flex items-center">
                {showKey ? wallet.keyValue : wallet.keyLabel}
              </div>
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
            {txs.map((t: any) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2" suppressHydrationWarning>
                  {mounted ? new Date(t.createdAt).toLocaleDateString() : ''}
                </td>
                <td className="py-2 font-mono">${Number(t.amount).toFixed(2)}</td>
                <td className="py-2 capitalize">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

