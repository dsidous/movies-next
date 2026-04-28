'use server';

import { getPopularPeople } from '@services/tmdb';

export async function getPopularPeoplePageAction(page: number) {
  const parsed = Number.isFinite(page) && page >= 1 ? Math.floor(page) : NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return { ok: false as const, error: 'Invalid page' };
  }
  try {
    const data = await getPopularPeople({ page: parsed });
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, error: 'Failed to load popular people' };
  }
}
