import { unstable_cache } from 'next/cache';

import { z } from 'zod';

import { tmdbFetch } from '../client';
import { getConfiguration } from '../configuration/api';
import type { MovieListItem, MovieListItemRow } from '../movie/schema';
import type { TvListItem, TvListItemRow } from '../tv/schema';
import { formatImageUrlWithBase, tmdbPath } from '../utils';
import { discoverEndpoints } from './endpoints';
import { DiscoverMovieResponseSchema, DiscoverTvResponseSchema } from './schema';

type QueryRecord = Record<string, string | number | boolean | null | undefined>;

// Discover results change as new content is added — cache for 1h
const TTL = 60 * 60;

function enrichMovieListItem(item: MovieListItemRow, imageBaseUrl: string): MovieListItem {
  return {
    ...item,
    posterUrl: formatImageUrlWithBase(item.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: item.backdrop_path
      ? formatImageUrlWithBase(item.backdrop_path, imageBaseUrl, 'original')
      : null,
    releaseYear: item.release_date ? item.release_date.split('-')[0]! : '',
  };
}

function enrichTvListItem(item: TvListItemRow, imageBaseUrl: string): TvListItem {
  return {
    ...item,
    posterUrl: formatImageUrlWithBase(item.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: item.backdrop_path
      ? formatImageUrlWithBase(item.backdrop_path, imageBaseUrl, 'original')
      : null,
    firstAirYear: item.first_air_date ? item.first_air_date.split('-')[0]! : '',
  };
}

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
      results: parsed.results.map((row) => enrichMovieListItem(row, images.imageBaseUrl)),
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
      results: parsed.results.map((row) => enrichTvListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-discover-tv'],
  { revalidate: TTL },
);
