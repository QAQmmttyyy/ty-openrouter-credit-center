import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Inter } from 'next/font/google'
import '../globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = params.locale;
  return {
    title: locale === 'zh' ? 'SonicAI' : 'SonicAI Credit Center',
    description: locale === 'zh' ? '管理您的 API 额度与密钥' : 'Manage your API credits and keys',
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const locale = params.locale;
  const messages = await getMessages({ locale });
 
  return (
    <html lang={locale || 'zh'}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale || 'zh'} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow bg-slate-50/50">
              {children}
            </main>
            <footer className="py-6 border-t bg-white">
              <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
                <div>© 2026 SonicAI</div>
                <div className="flex gap-6">
                  <Link href={`/${locale}/terms`} className="hover:underline">
                    {locale === 'zh' ? '服务条款' : 'Terms'}
                  </Link>
                  <Link href={`/${locale}/privacy`} className="hover:underline">
                    {locale === 'zh' ? '隐私政策' : 'Privacy'}
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
