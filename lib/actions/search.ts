'use server';

import { searchMulti } from '@services/tmdb';

type SearchData = Awaited<ReturnType<typeof searchMulti>>;

export async function searchMultiAction(query: string, page: number = 1) {
  const q = query.trim();
  if (!q) {
    const data: SearchData = { page: 1, results: [], total_pages: 0, total_results: 0 };
    return { ok: true as const, data };
  }
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  try {
    const data = await searchMulti({ query: q, page: safePage });
    return { ok: true as const, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Search failed';
    return { ok: false as const, error: message };
  }
}
