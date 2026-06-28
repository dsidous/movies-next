'use server';

import { getMovieReviews, getTvReviews } from '@services/tmdb';
import type { MovieReviewsResponse } from '@services/tmdb/movie/schema';

export async function getMediaReviewsAction(
  media: 'movie' | 'tv',
  id: number,
  page: number,
): Promise<{ ok: true; data: MovieReviewsResponse } | { ok: false; error: string }> {
  if (!Number.isFinite(id) || id < 1) {
    return { ok: false, error: 'Invalid media id' };
  }
  if (!Number.isFinite(page) || page < 1) {
    return { ok: false, error: 'Invalid page' };
  }
  try {
    const data =
      media === 'movie'
        ? await getMovieReviews(id, { page })
        : await getTvReviews(id, { page });
    return { ok: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load reviews';
    return { ok: false, error: message };
  }
}
