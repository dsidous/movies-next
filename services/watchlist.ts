import { db } from '@/db';
import { and, desc, eq } from 'drizzle-orm';
import 'server-only';

import { watchlist } from '@/db/schema';

export const watchlistService = {
  /** Composite keys: `"movie:123"` / `"tv:456"` (matches `media_id` text). */
  async getKeysForUser(userId: string) {
    const rows = await db
      .select({
        mediaType: watchlist.mediaType,
        mediaId: watchlist.mediaId,
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId));

    return rows.map((r) => `${r.mediaType}:${r.mediaId}`);
  },

  async getForUser(userId: string) {
    return await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));
  },

  async toggle(userId: string, mediaType: 'movie' | 'tv', mediaId: string, title: string) {
    // Check if it exists
    const existing = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.mediaType, mediaType),
          eq(watchlist.mediaId, mediaId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return await db
        .delete(watchlist)
        .where(
          and(
            eq(watchlist.userId, userId),
            eq(watchlist.mediaType, mediaType),
            eq(watchlist.mediaId, mediaId),
          ),
        );
    }

    return await db.insert(watchlist).values({
      userId,
      mediaType,
      mediaId,
      title,
    });
  },
};
