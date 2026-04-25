'use client'

import { Languages } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'zh' : 'en'
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <button 
      onClick={toggleLocale}
      className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
      title={locale === 'en' ? '切换为中文' : 'Switch to English'}
    >
      <Languages size={20} />
    </button>
  )
}
