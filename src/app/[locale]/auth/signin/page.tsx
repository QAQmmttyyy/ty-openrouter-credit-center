'use client'

import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import Link from 'next/link'
import { Key } from 'lucide-react'

export default function SignIn() {
  const t = useTranslations('Auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: `/${locale}/dashboard`,
      })
      if (res?.ok) setSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm p-8 bg-white border rounded-2xl shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-2">{t('success')}</h1>
          <p className="text-muted-foreground mb-6">{t('successDesc')}</p>
          <Link href={`/${locale}`} className="text-blue-600 hover:underline">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <div className="absolute top-6 right-6">
        <LocaleSwitcher />
      </div>
      
      <div className="w-full max-w-sm p-8 bg-white border rounded-2xl shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Key size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">{t('signIn')}</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">{t('desc')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('emailLabel')}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {loading ? '...' : t('sendLink')}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link href={`/${locale}`} className="text-sm text-muted-foreground hover:text-foreground">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
