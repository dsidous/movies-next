'use server';

import { ensureUserByClerkId, watchlistService } from '@/services';
import { auth } from '@clerk/nextjs/server';

export type ToggleWatchlistResult =
  | { ok: true }
  | { ok: false; code: 'unauthenticated' };

export async function toggleWatchlistAction(
  mediaType: 'movie' | 'tv',
  mediaId: string,
  title: string,
): Promise<ToggleWatchlistResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { ok: false, code: 'unauthenticated' };
  }
  const user = await ensureUserByClerkId(clerkUserId);
  await watchlistService.toggle(user.id, mediaType, mediaId, title);
  return { ok: true };
}
