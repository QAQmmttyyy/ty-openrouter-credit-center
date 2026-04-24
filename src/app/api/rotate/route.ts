import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { wallets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { get_key, update_key, create_key } from '@/lib/openrouter'
import { NextResponse } from 'next/server'

export async function POST() {
  const sess = await getServerSession(authOptions)
  if (!sess?.user) return new Response('Unauthorized', { status: 401 })
  const uid = sess.user.id

  const [w] = await db.select().from(wallets).where(eq(wallets.userId, uid))
  if (!w?.keyHash) return new Response('No key to rotate', { status: 400 })

  try {
    // 1. Get current status of old key
    const ork = await get_key(w.keyHash)
    if (!ork) throw new Error('OLD_KEY_NOT_FOUND')

    const remaining = ork.limit_remaining ?? 0
    const usage = ork.usage ?? 0

    // 2. Create NEW key with the same remaining balance
    const ok = await create_key(`USER_${uid.slice(0, 8)}_ROTATED_${Date.now()}`, remaining)

    // 3. Update database with NEW key details IMMEDIATELY
    await db.update(wallets).set({
      keyHash: ok.hash,
      keyLabel: ok.label,
      keyValue: ok.key,
      updatedAt: new Date(),
    }).where(eq(wallets.userId, uid))

    // 4. Lock OLD key by setting limit to its current usage and disabling it
    try {
      await update_key(w.keyHash, { 
        limit: usage,
        disabled: true 
      })
    } catch (lockErr) {
      console.warn('Failed to lock old key, but new key is already active:', lockErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Rotate failed:', err)
    return NextResponse.json({ err: 'ROTATE_FAILED' }, { status: 500 })
  }
}
