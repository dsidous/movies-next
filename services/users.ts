import { getDb } from '@/db';
import { eq } from 'drizzle-orm';

import { users } from '@/db/schema';

export async function upsertUser(clerkId: string) {
  const db = await getDb();
  return await db
    .insert(users)
    .values({
      externalId: clerkId,
    })
    .onConflictDoNothing({
      target: users.externalId,
    })
    .returning();
}

/**
 * Ensures a `users` row exists for this Clerk id (same as the webhook insert).
 * Safe when the webhook is delayed or unavailable: first dashboard hit creates the row.
 */
export async function ensureUserByClerkId(clerkId: string) {
  await upsertUser(clerkId);
  const db = await getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, clerkId),
  });
  if (!user) {
    throw new Error('Failed to ensure user row');
  }
  return user;
}
