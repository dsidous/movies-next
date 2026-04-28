/** Parsed `/tv` URL search state mapped to TMDB discover TV query params. */

export type TvBrowseSearchState = {
  page: number;
  sort: string;
  genreIds: number[];
  /** Maps to TMDB `first_air_date_year`. */
  year: number | null;
  /** Maps to TMDB `vote_average.gte`. */
  voteGreaterThan: number | null;
};

const DEFAULT_SORT = 'popularity.desc';

const ALLOWED_RATING_THRESHOLDS = new Set(['5', '6', '7', '8', '9']);

/** TMDB `/discover/tv` `sort_by` values — subset with readable labels. */
export const TV_DISCOVER_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'first_air_date.desc', label: 'Newest first air' },
  { value: 'first_air_date.asc', label: 'Oldest first air' },
  { value: 'vote_count.desc', label: 'Most votes' },
  { value: 'name.asc', label: 'Title (A–Z)' },
  { value: 'name.desc', label: 'Title (Z–A)' },
];

function first(raw: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = raw[key];
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parsePositiveInt(s: string | undefined, fallback: number, max?: number): number {
  if (!s) return fallback;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  if (max !== undefined) return Math.min(n, max);
  return n;
}

function parseOptionalYear(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (!Number.isFinite(n) || n < 1874 || n > 2100) return null;
  return n;
}

function parseVoteGreaterThan(raw: string | undefined): number | null {
  if (!raw) return null;
  if (!ALLOWED_RATING_THRESHOLDS.has(raw)) return null;
  return Number.parseFloat(raw);
}

function parseGenreIds(s: string | undefined): number[] {
  if (!s) return [];
  const parts = s.split(',').map((x) => x.trim());
  const ids = new Set<number>();
  for (const p of parts) {
    const n = Number.parseInt(p, 10);
    if (Number.isFinite(n) && n > 0) ids.add(n);
  }
  return [...ids];
}

const ALLOWED_SORT = new Set(TV_DISCOVER_SORT_OPTIONS.map((o) => o.value));

export function parseTvBrowseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): TvBrowseSearchState {
  const sortRaw = first(raw, 'sort');
  const sort = sortRaw && ALLOWED_SORT.has(sortRaw) ? sortRaw : DEFAULT_SORT;
  const page = parsePositiveInt(first(raw, 'page'), 1, 500);
  const genreIds = parseGenreIds(first(raw, 'genres'));
  const year = parseOptionalYear(first(raw, 'year'));
  const voteGreaterThan = parseVoteGreaterThan(first(raw, 'vmin'));

  return {
    page,
    sort,
    genreIds,
    year,
    voteGreaterThan,
  };
}

export function tvBrowseStateToDiscoverQuery(
  state: TvBrowseSearchState,
): Record<string, string | number | boolean | null | undefined> {
  const q: Record<string, string | number | boolean | null | undefined> = {
    page: state.page,
    sort_by: state.sort,
  };
  if (state.genreIds.length > 0) {
    q.with_genres = state.genreIds.join(',');
  }
  if (state.year !== null) {
    q.first_air_date_year = state.year;
  }
  if (state.voteGreaterThan !== null) {
    q['vote_average.gte'] = state.voteGreaterThan;
  }
  return q;
}

export function serializeTvBrowseSearchParams(state: TvBrowseSearchState): string {
  const p = new URLSearchParams();
  if (state.sort !== DEFAULT_SORT) p.set('sort', state.sort);
  if (state.genreIds.length > 0) p.set('genres', state.genreIds.sort((a, b) => a - b).join(','));
  if (state.year !== null) p.set('year', String(state.year));
  if (state.voteGreaterThan !== null) p.set('vmin', String(state.voteGreaterThan));
  const s = p.toString();
  return s.length ? `?${s}` : '';
}
