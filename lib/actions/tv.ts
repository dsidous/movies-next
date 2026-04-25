'use server';

import { getTvSeason } from '@services/tmdb';

export type TvSeasonPayload = Awaited<ReturnType<typeof getTvSeason>>;

export async function getTvSeasonAction(
  seriesId: number,
  seasonNumber: number,
): Promise<{ ok: true; data: TvSeasonPayload } | { ok: false; error: string }> {
  if (!Number.isFinite(seriesId) || seriesId < 1) {
    return { ok: false, error: 'Invalid series' };
  }
  if (!Number.isFinite(seasonNumber) || seasonNumber < 0) {
    return { ok: false, error: 'Invalid season' };
  }
  try {
    const data = await getTvSeason(seriesId, seasonNumber);
    return { ok: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load season';
    return { ok: false, error: message };
  }
}
