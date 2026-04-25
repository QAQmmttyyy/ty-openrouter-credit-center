'use client'

import useSWR from 'swr'
import { CreditCard, Key, History, LogOut, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { LocaleSwitcher } from './LocaleSwitcher'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface DashboardData {
  balance: number
  usage: number
  wallet: {
    keyHash: string | null
    keyLabel: string | null
    keyValue: string | null
  } | null
  transactions: {
    id: string
    amount: number
    status: string
    createdAt: number
  }[]
  error?: string
}

export function DashboardContent({ initialData }: { initialData: DashboardData }) {
  const t = useTranslations('Dashboard')
  const tc = useTranslations('Common')
  const locale = useLocale()

  const [mounted, setMounted] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const { data, error, mutate } = useSWR<DashboardData>('/api/dashboard', fetcher, {
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

  const rotateKey = async () => {
    setRotating(true)
    try {
      const res = await fetch('/api/rotate', { method: 'POST' })
      if (res.ok) {
        await mutate()
        setShowKey(true)
      } else {
        alert('Rotation failed')
      }
    } catch (err) {
      alert('Rotation failed')
    } finally {
      setRotating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-muted-foreground text-sm font-medium block">{t('balance')}</span>
            <span className="text-4xl font-mono font-bold">
              {(error || dataError) ? '-.-' : `$${Number(balance).toFixed(2)}`}
            </span>
          </div>
          <div className="flex gap-2">
            <LocaleSwitcher />
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
              title={t('signOut')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={18} className="text-blue-500" />
              <h2 className="font-semibold">{t('apiKey')}</h2>
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
                  title={t('copy')}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>

                <AlertDialog>
                  <AlertDialogTrigger
                    disabled={rotating}
                    className={`p-1 hover:bg-muted rounded transition-colors text-orange-500 ${rotating ? 'animate-spin' : ''}`}
                    title={t('rotateKey')}
                  >
                    <RefreshCw size={16} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('rotateConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('rotateConfirmDesc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={rotateKey} className="bg-orange-500 hover:bg-orange-600">
                        {t('rotateKey')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
              {t('noKey')}
            </p>
          )}
        </section>

        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-green-500" />
            <h2 className="font-semibold">{t('topUp')}</h2>
          </div>
          <div className="flex gap-2">
            {[10, 20, 50].map(amt => (
              <form key={amt} action="/api/topup" method="POST">
                <input type="hidden" name="amt" value={amt} />
                <input type="hidden" name="locale" value={locale} />
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
          <h2 className="font-semibold">{t('recentTransactions')}</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground border-b">
            <tr>
              <th className="text-left pb-2">{t('date')}</th>
              <th className="text-left pb-2">{t('amount')}</th>
              <th className="text-left pb-2">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2" suppressHydrationWarning>
                  {mounted ? new Date(item.createdAt).toLocaleDateString(locale) : ''}
                </td>
                <td className="py-2 font-mono">${Number(item.amount).toFixed(2)}</td>
                <td className="py-2 capitalize">{item.status === 'completed' ? t('completed') : item.status === 'pending' ? t('pending') : t('failed')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
