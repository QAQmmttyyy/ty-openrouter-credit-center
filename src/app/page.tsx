import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const sess = await getServerSession(authOptions)
  if (sess) redirect('/dashboard')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        Local AI <span className="text-blue-600">Credit Center</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-lg">
        The simplest way to manage your OpenRouter credits for your local AI client. 
        Top up, get a key, and start chatting.
      </p>
      <Link 
        href="/api/auth/signin" 
        className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Get Started
      </Link>
    </div>
  )
}
