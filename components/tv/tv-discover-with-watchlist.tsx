import type { TvDiscoverFilters } from '@/lib/actions/discover';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';

import { type DiscoverTvPayload, TvDiscoverInfinite } from './tv-discover-infinite';

type TvDiscoverInfiniteWithWatchlistProps = {
  initial: DiscoverTvPayload;
  filters: TvDiscoverFilters;
  genreMap: Map<number, string>;
};

export async function TvDiscoverInfiniteWithWatchlist(props: TvDiscoverInfiniteWithWatchlistProps) {
  const watchlistedKeys = await getWatchlistedKeys();
  return <TvDiscoverInfinite {...props} watchlistedKeys={watchlistedKeys} />;
}
