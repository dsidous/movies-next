import type { TvDetails } from '@services/tmdb/tv/schema';

/** Same as movie/TV id route parsing — positive integer TMDB id. */
export function parseTmdbIdParam(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export type SeasonSummary = {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
};

function seasonRowFromUnknown(s: unknown): SeasonSummary | null {
  if (s == null || typeof s !== 'object') return null;
  const o = s as Record<string, unknown>;
  const sn = o.season_number;
  if (typeof sn !== 'number' || !Number.isFinite(sn)) return null;
  const name = typeof o.name === 'string' ? o.name : `Season ${sn}`;
  const ec = o.episode_count;
  const episodeCount = typeof ec === 'number' && Number.isFinite(ec) ? ec : 0;
  const ad = o.air_date;
  const airDate = typeof ad === 'string' && ad.length > 0 ? ad : null;
  return { seasonNumber: sn, name, episodeCount, airDate };
}

/**
 * All seasons (including specials, season 0) sorted by `season_number`.
 */
export function getSeasonsSummary(tv: TvDetails): SeasonSummary[] {
  const seasons = tv.seasons;
  if (!Array.isArray(seasons) || seasons.length === 0) return [];
  const out: SeasonSummary[] = [];
  for (const s of seasons) {
    const row = seasonRowFromUnknown(s);
    if (row) out.push(row);
  }
  return out.sort((a, b) => a.seasonNumber - b.seasonNumber);
}

/**
 * "Latest" = season of `last_episode_to_air` when set, else highest `season_number` in the list.
 */
export function getLatestSeasonNumber(tv: TvDetails): number | null {
  const last = tv.last_episode_to_air;
  if (last && typeof last === 'object' && last !== null) {
    const sn = (last as Record<string, unknown>).season_number;
    if (typeof sn === 'number' && sn >= 0) return sn;
  }
  const list = getSeasonsSummary(tv);
  if (list.length === 0) return null;
  return list[list.length - 1]!.seasonNumber;
}

export function formatAvgEpisodeRuntime(
  runtimes: number[] | null | undefined,
): string {
  if (!runtimes?.length) return '';
  const total = runtimes.reduce((a, b) => a + b, 0);
  const m = Math.round(total / runtimes.length);
  if (m <= 0) return '';
  if (m < 60) return `~${m}m / ep`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (r === 0) return `~${h}h / ep`;
  return `~${h}h ${r}m / ep`;
}

export function formatAirRange(tv: TvDetails): string {
  const start = tv.first_air_date ? tv.first_air_date.split('-')[0]! : null;
  const end = tv.last_air_date ? tv.last_air_date.split('-')[0]! : null;
  if (start && end && start !== end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return '';
}
