import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  return {
    title: locale === 'zh' ? 'OpenRouter 额度中心' : 'OpenRouter Credit Center',
    description: locale === 'zh' ? '管理您的 API 额度与密钥' : 'Manage your API credits and keys',
  };
}

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
 
  return (
    <html lang={locale || 'zh'}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale || 'zh'} messages={messages}>
          <main className="min-h-screen bg-slate-50/50">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
