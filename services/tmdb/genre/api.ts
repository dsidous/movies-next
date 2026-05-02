import { unstable_cache } from 'next/cache';

import { z } from 'zod';

import { tmdbFetch } from '../client';
import { genreEndpoints } from './endpoints';
import { GenreListResponseSchema } from './schema';

// Genre lists never change — cache for 24h
const TTL = 60 * 60 * 24;

export const getMovieGenres = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof GenreListResponseSchema>>(genreEndpoints.movieList);
    return GenreListResponseSchema.parse(data).genres;
  },
  ['tmdb-genre-movie-list'],
  { revalidate: TTL },
);

export const getTvGenres = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof GenreListResponseSchema>>(genreEndpoints.tvList);
    return GenreListResponseSchema.parse(data).genres;
  },
  ['tmdb-genre-tv-list'],
  { revalidate: TTL },
);
