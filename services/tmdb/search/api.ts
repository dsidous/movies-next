import { z } from 'zod';

import { tmdbFetch } from '../client';
import { getConfiguration } from '../configuration/api';
import { formatImageUrlWithBase, tmdbPath } from '../utils';
import { searchEndpoints } from './endpoints';
import type { SearchMultiResult, SearchMultiResultRow } from './schema';
import { SearchMultiResponseSchema } from './schema';

type QueryRecord = Record<string, string | number | boolean | null | undefined>;
export type SearchMultiQuery = { query: string } & QueryRecord;

// Search is intentionally NOT cached — queries are unique per user input and
// caching them would waste memory while providing almost zero hit rate.
// The fetch-level `next: { revalidate }` in client.ts still deduplicates
// identical in-flight requests within the same render.

function enrichSearchMultiItem(row: SearchMultiResultRow, imageBaseUrl: string): SearchMultiResult {
  const id = row.id;
  const media_type = row.media_type;

  if (media_type === 'person') {
    const r = row as SearchMultiResultRow & { profile_path?: string | null; name?: string };
    return {
      id,
      media_type,
      name: typeof r.name === 'string' ? r.name : undefined,
      profileUrl: formatImageUrlWithBase(r.profile_path ?? null, imageBaseUrl, 'w500'),
    };
  }

  if (media_type === 'tv') {
    const r = row as SearchMultiResultRow & {
      poster_path?: string | null;
      backdrop_path?: string | null;
      first_air_date?: string;
      name?: string;
    };
    return {
      id,
      media_type,
      name: typeof r.name === 'string' ? r.name : undefined,
      posterUrl: formatImageUrlWithBase(r.poster_path ?? null, imageBaseUrl, 'w500'),
      backdropUrl: r.backdrop_path
        ? formatImageUrlWithBase(r.backdrop_path, imageBaseUrl, 'original')
        : null,
      firstAirYear: r.first_air_date ? r.first_air_date.split('-')[0]! : '',
    };
  }

  const r = row as SearchMultiResultRow & {
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    title?: string;
  };
  return {
    id,
    media_type,
    title: typeof r.title === 'string' ? r.title : undefined,
    posterUrl: formatImageUrlWithBase(r.poster_path ?? null, imageBaseUrl, 'w500'),
    backdropUrl: r.backdrop_path
      ? formatImageUrlWithBase(r.backdrop_path, imageBaseUrl, 'original')
      : null,
    releaseYear: r.release_date ? r.release_date.split('-')[0]! : '',
  };
}

export async function searchMulti(params: SearchMultiQuery) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof SearchMultiResponseSchema>>(
      tmdbPath(searchEndpoints.multi, { ...params, query: params.query }),
    ),
    getConfiguration(),
  ]);
  const parsed = SearchMultiResponseSchema.parse(data);
  return {
    ...parsed,
    results: parsed.results.map((r) => enrichSearchMultiItem(r, images.imageBaseUrl)),
  };
}
