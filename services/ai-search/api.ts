import { aiSearchFetch } from './client';
import { InterpretResponseSchema } from './schema';

export async function interpretSearchQuery(query: string) {
  const q = query.trim();
  if (!q) {
    return { search_terms: [] as string[] };
  }

  const data = await aiSearchFetch<unknown>('/interpret', {
    method: 'POST',
    body: JSON.stringify({ query: q }),
  });

  return InterpretResponseSchema.parse(data);
}
