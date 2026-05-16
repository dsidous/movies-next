import { cache } from 'react';

import { auth } from '@clerk/nextjs/server';
import 'server-only';

import { ensureUserByClerkId } from '@/services/users';
import { watchlistService } from '@/services/watchlist';

async function getWatchlistedKeysUncached(): Promise<string[]> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await ensureUserByClerkId(clerkUserId);
  return watchlistService.getKeysForUser(user.id);
}

/** Empty when signed out. Ensures a `users` row exists when signed in. Deduped per request. */
export const getWatchlistedKeys = cache(getWatchlistedKeysUncached);
