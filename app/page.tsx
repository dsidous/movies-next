import { Suspense } from 'react';

import { pickHeroSpotlight } from '@/lib/pick-hero-spotlight';
import {
  getNowPlayingMovies,
  getOnTheAirTv,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
  getTrendingMovies,
  getTrendingTv,
} from '@services/tmdb';

import type { HomeFeedRow } from '@/components/media/home-feed';
import { HomeFeedSkeleton } from '@/components/media/home-feed-skeleton';
import { HomeFeedWithWatchlist } from '@/components/media/home-feed-with-watchlist';
import { TrendingHero } from '@/components/media/trending-hero';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [
    trendingMovies,
    trendingTv,
    popularMovies,
    popularTv,
    topRatedMovies,
    topRatedTv,
    nowPlaying,
    onTheAir,
  ] = await Promise.all([
    getTrendingMovies('week', { page: 1 }),
    getTrendingTv('week', { page: 1 }),
    getPopularMovies({ page: 1 }),
    getPopularTv({ page: 1 }),
    getTopRatedMovies({ page: 1 }),
    getTopRatedTv({ page: 1 }),
    getNowPlayingMovies({ page: 1 }),
    getOnTheAirTv({ page: 1 }),
  ]);

  const hero = pickHeroSpotlight(trendingMovies.results, trendingTv.results);

  const rows: HomeFeedRow[] = [
    {
      kind: 'movie',
      title: 'Trending movies',
      items: trendingMovies.results,
    },
    { kind: 'tv', title: 'Trending TV', items: trendingTv.results },
    { kind: 'movie', title: 'Popular movies', items: popularMovies.results },
    { kind: 'tv', title: 'Popular TV', items: popularTv.results },
    {
      kind: 'movie',
      title: 'Top rated movies',
      items: topRatedMovies.results,
    },
    { kind: 'tv', title: 'Top rated TV', items: topRatedTv.results },
    { kind: 'movie', title: 'In theaters', items: nowPlaying.results },
    { kind: 'tv', title: 'On the air', items: onTheAir.results },
  ];

  return (
    <div className="w-full min-w-0">
      {hero && <TrendingHero spotlight={hero} />}

      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeedWithWatchlist rows={rows} />
      </Suspense>
    </div>
  );
}
