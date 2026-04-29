import 'server-only';

import { watchlist } from '@/db/schema';
import { tmdbFetch } from '@/services/tmdb/client';
import { getConfiguration } from '@/services/tmdb/configuration/api';
import { movieEndpoints } from '@/services/tmdb/movie/endpoints';
import { MovieDetailsRowSchema } from '@/services/tmdb/movie/schema';
import { tvEndpoints } from '@/services/tmdb/tv/endpoints';
import { TvDetailsRowSchema } from '@/services/tmdb/tv/schema';
import { formatImageUrlWithBase } from '@/services/tmdb/utils';

export type WatchlistCardData = {
  entryId: string;
  id: number;
  type: 'movie' | 'tv';
  title: string;
  year: string;
  posterUrl: string;
  voteAverage?: number;
  voteCount?: number;
};

type WatchlistRow = typeof watchlist.$inferSelect;

function fallbackCard(row: WatchlistRow, numericId: number): WatchlistCardData {
  return {
    entryId: row.id,
    id: numericId,
    type: row.mediaType,
    title: row.title?.trim() || 'Saved title',
    year: '',
    posterUrl: '/placeholder-poster.png',
  };
}

export async function resolveWatchlistCards(rows: WatchlistRow[]): Promise<WatchlistCardData[]> {
  if (rows.length === 0) return [];

  const { images } = await getConfiguration();
  const imageBaseUrl = images.imageBaseUrl;

  return Promise.all(
    rows.map(async (row) => {
      const id = Number.parseInt(row.mediaId, 10);
      if (!Number.isFinite(id)) {
        return fallbackCard(row, 0);
      }

      try {
        if (row.mediaType === 'movie') {
          const raw = await tmdbFetch<Record<string, unknown>>(movieEndpoints.details(id));
          const m = MovieDetailsRowSchema.parse(raw);
          return {
            entryId: row.id,
            id: m.id,
            type: 'movie' as const,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0]! : '',
            posterUrl: formatImageUrlWithBase(m.poster_path, imageBaseUrl, 'w500'),
            voteAverage: m.vote_average,
            voteCount: m.vote_count,
          };
        }

        const raw = await tmdbFetch<Record<string, unknown>>(tvEndpoints.details(id));
        const t = TvDetailsRowSchema.parse(raw);
        return {
          entryId: row.id,
          id: t.id,
          type: 'tv' as const,
          title: t.name,
          year: t.first_air_date ? t.first_air_date.split('-')[0]! : '',
          posterUrl: formatImageUrlWithBase(t.poster_path, imageBaseUrl, 'w500'),
          voteAverage: t.vote_average,
          voteCount: t.vote_count,
        };
      } catch {
        return fallbackCard(row, id);
      }
    }),
  );
}
