import { unstable_cache } from 'next/cache';

import { z } from 'zod';

import { tmdbFetch } from '../client';
import { getConfiguration } from '../configuration/api';
import { toMovieListItem } from '../movie/api';
import { toTvListItem } from '../tv/api';
import { tmdbPath } from '../utils';
import { discoverEndpoints } from './endpoints';
import { DiscoverMovieResponseSchema, DiscoverTvResponseSchema } from './schema';

type QueryRecord = Record<string, string | number | boolean | null | undefined>;

// Discover results change as new content is added — cache for 1h
const TTL = 60 * 60;

/**
 * Discover movies; pass TMDB filter/sort options as query (e.g. `sort_by`, `with_genres`, `page`, `region`).
 * @see https://developer.themoviedb.org/reference/discover-movie
 */
export const discoverMovies = unstable_cache(
  async (query?: QueryRecord) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof DiscoverMovieResponseSchema>>(
        tmdbPath(discoverEndpoints.movie, query),
      ),
      getConfiguration(),
    ]);
    const parsed = DiscoverMovieResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-discover-movies'],
  { revalidate: TTL },
);

/**
 * Discover TV; pass TMDB filter/sort options as query (e.g. `sort_by`, `with_genres`, `page`, `timezone`).
 * @see https://developer.themoviedb.org/reference/discover-tv
 */
export const discoverTv = unstable_cache(
  async (query?: QueryRecord) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof DiscoverTvResponseSchema>>(tmdbPath(discoverEndpoints.tv, query)),
      getConfiguration(),
    ]);
    const parsed = DiscoverTvResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toTvListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-discover-tv'],
  { revalidate: TTL },
);
