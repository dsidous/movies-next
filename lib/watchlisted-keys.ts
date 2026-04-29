import 'server-only';

import { watchlistService } from '@/services/watchlist';
import { ensureUserByClerkId } from '@/services/users';
import { auth } from '@clerk/nextjs/server';

/** Empty when signed out. Ensures a `users` row exists when signed in. */
export async function getWatchlistedKeys(): Promise<string[]> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await ensureUserByClerkId(clerkUserId);
  return watchlistService.getKeysForUser(user.id);
}
