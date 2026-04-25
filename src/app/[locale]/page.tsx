import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const sess = await getServerSession(authOptions)
  if (sess) redirect(`/${locale}/dashboard`)

  const t = await getTranslations({ locale, namespace: 'Home' })

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="absolute top-6 right-6">
        <LocaleSwitcher />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        {t('titlePrefix')}<span className="text-blue-600">{t('titleSuffix')}</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        {t('description')}
      </p>
      <Link 
        href={`/${locale}/auth/signin`} 
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        {t('getStarted')}
      </Link>
    </div>
  )
}
