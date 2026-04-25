import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Terms' })
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      <div className="prose prose-slate dark:prose-invert">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. {t('section1Title')}</h2>
          <p>{t('section1Content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. {t('section2Title')}</h2>
          <p className="font-medium text-red-500">{t('section2Content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. {t('section3Title')}</h2>
          <p>{t('section3Content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. {t('section4Title')}</h2>
          <p>{t('section4Content')}</p>
        </section>

        <div className="mt-12 text-sm text-gray-500">
          {t('lastUpdated')}
        </div>
        <div className="mt-6">
          <Link href={`/${locale}`} className="text-blue-500 hover:underline">{t('back')}</Link>
        </div>
      </div>
    </div>
  )
}
