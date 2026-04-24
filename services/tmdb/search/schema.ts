import { z } from 'zod';

export const SearchMultiResultRowSchema = z.looseObject({
  id: z.number(),
  media_type: z.string(),
});
export type SearchMultiResultRow = z.infer<typeof SearchMultiResultRowSchema>;

export type SearchMultiResult = SearchMultiResultRow & {
  posterUrl?: string;
  backdropUrl?: string | null;
  profileUrl?: string;
  releaseYear?: string;
  firstAirYear?: string;
};

export const SearchMultiResponseSchema = z.object({
  page: z.number(),
  results: z.array(SearchMultiResultRowSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type SearchMultiResponse = z.infer<typeof SearchMultiResponseSchema>;
