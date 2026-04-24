import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { create_checkout } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const sess = await getServerSession(authOptions)
  if (!sess?.user) return new Response('Unauthorized', { status: 401 })

  const data = await req.formData()
  const amt = parseFloat(data.get('amt') as string)
  if (isNaN(amt) || amt <= 0) return new Response('Invalid amount', { status: 400 })

  const checkout = await create_checkout(
    sess.user.id,
    sess.user.email!,
    amt
  )

  return NextResponse.redirect(checkout.url!, { status: 303 })
}
