import type { MoviesDiscoverFilters } from '@/lib/actions/discover';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';

import { type DiscoverMoviesPayload, MoviesDiscoverInfinite } from './movies-discover-infinite';

type MoviesDiscoverInfiniteWithWatchlistProps = {
  initial: DiscoverMoviesPayload;
  filters: MoviesDiscoverFilters;
  genreMap: Map<number, string>;
};

export async function MoviesDiscoverInfiniteWithWatchlist(
  props: MoviesDiscoverInfiniteWithWatchlistProps,
) {
  const watchlistedKeys = await getWatchlistedKeys();
  return <MoviesDiscoverInfinite {...props} watchlistedKeys={watchlistedKeys} />;
}
