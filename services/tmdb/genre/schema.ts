import { z } from 'zod';

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Genre = z.infer<typeof GenreSchema>;

export const GenreListResponseSchema = z.object({
  genres: z.array(GenreSchema),
});

export type GenreListResponse = z.infer<typeof GenreListResponseSchema>;
