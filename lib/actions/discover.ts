'use server';

import { discoverMovies, discoverTv } from '@services/tmdb';

import type { MoviesBrowseSearchState } from '@/lib/movies-discover-search-params';
import { moviesBrowseStateToDiscoverQuery } from '@/lib/movies-discover-search-params';
import type { TvBrowseSearchState } from '@/lib/tv-discover-search-params';
import { tvBrowseStateToDiscoverQuery } from '@/lib/tv-discover-search-params';

export type MoviesDiscoverFilters = Omit<MoviesBrowseSearchState, 'page'>;
export type TvDiscoverFilters = Omit<TvBrowseSearchState, 'page'>;

function safePage(page: number): number {
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  return Math.min(p, 500);
}

export async function discoverMoviesPageAction(filters: MoviesDiscoverFilters, page: number) {
  try {
    const query = moviesBrowseStateToDiscoverQuery({ ...filters, page: safePage(page) });
    const data = await discoverMovies(query);
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, error: 'Failed to load movies' };
  }
}

export async function discoverTvPageAction(filters: TvDiscoverFilters, page: number) {
  try {
    const query = tvBrowseStateToDiscoverQuery({ ...filters, page: safePage(page) });
    const data = await discoverTv(query);
    return { ok: true as const, data };
  } catch {
    return { ok: false as const, error: 'Failed to load series' };
  }
}
