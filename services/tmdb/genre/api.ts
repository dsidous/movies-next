import { z } from 'zod';

import { tmdbFetch } from '../client';
import { genreEndpoints } from './endpoints';
import { GenreListResponseSchema } from './schema';

export async function getMovieGenres() {
  const data = await tmdbFetch<z.input<typeof GenreListResponseSchema>>(genreEndpoints.movieList);
  return GenreListResponseSchema.parse(data).genres;
}

export async function getTvGenres() {
  const data = await tmdbFetch<z.input<typeof GenreListResponseSchema>>(genreEndpoints.tvList);
  return GenreListResponseSchema.parse(data).genres;
}
