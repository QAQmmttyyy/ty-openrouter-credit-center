import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core'
import type { AdapterAccount } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
})

export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}))

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
})

export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

export const wallets = sqliteTable('wallet', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalPurchased: real('total_purchased').notNull().default(0),
  keyHash: text('key_hash'),
  keyLabel: text('key_label'),
  keyValue: text('key_value'), // Only shown once during creation
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
})

export const transactions = sqliteTable('transaction', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  type: text('type').notNull(), // 'topup', 'usage_sync'
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  stripeSessionId: text('stripe_session_id'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})
