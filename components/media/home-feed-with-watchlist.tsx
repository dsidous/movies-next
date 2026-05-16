import { getWatchlistedKeys } from '@/lib/watchlisted-keys';

import { HomeFeed, type HomeFeedRow } from './home-feed';

export async function HomeFeedWithWatchlist({ rows }: { rows: HomeFeedRow[] }) {
  const watchlistedKeys = await getWatchlistedKeys();
  return <HomeFeed rows={rows} watchlistedKeys={watchlistedKeys} />;
}
