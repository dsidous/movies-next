import { z } from 'zod';

export const InterpretResponseSchema = z.object({
  search_terms: z.array(z.string()),
});
export type InterpretResponse = z.infer<typeof InterpretResponseSchema>;
