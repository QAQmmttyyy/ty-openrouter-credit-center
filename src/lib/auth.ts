import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'
import { wallets } from './db/schema'
import { randomUUID } from 'crypto'

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
  },
  events: {
    async createUser({ user }) {
      await db.insert(wallets).values({
        id: randomUUID(),
        userId: user.id,
      })
    },
  },
}
