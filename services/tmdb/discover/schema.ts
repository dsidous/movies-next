import { z } from 'zod';

import { MovieListItemRowSchema } from '../movie/schema';
import { TvListItemRowSchema } from '../tv/schema';

export const DiscoverMovieResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieListItemRowSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type DiscoverMovieResponse = z.infer<typeof DiscoverMovieResponseSchema>;

export const DiscoverTvResponseSchema = z.object({
  page: z.number(),
  results: z.array(TvListItemRowSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type DiscoverTvResponse = z.infer<typeof DiscoverTvResponseSchema>;
