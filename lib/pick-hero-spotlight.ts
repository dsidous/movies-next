import type { MovieListItem } from '@services/tmdb/movie/schema';
import type { TvListItem } from '@services/tmdb/tv/schema';

export type HeroKind = 'movie' | 'tv';

export type HeroSpotlight = { kind: HeroKind; item: MovieListItem | TvListItem };

export function pickHeroSpotlight(
  trendingMovies: MovieListItem[],
  trendingTv: TvListItem[],
): HeroSpotlight | null {
  const withBackdrop: HeroSpotlight[] = [
    ...trendingMovies
      .filter((m) => m.backdropUrl)
      .map((item) => ({ kind: 'movie' as const, item })),
    ...trendingTv.filter((t) => t.backdropUrl).map((item) => ({ kind: 'tv' as const, item })),
  ];

  const pool: HeroSpotlight[] =
    withBackdrop.length > 0
      ? withBackdrop
      : [
          ...trendingMovies.map((item) => ({ kind: 'movie' as const, item })),
          ...trendingTv.map((item) => ({ kind: 'tv' as const, item })),
        ];

  if (pool.length === 0) {
    return null;
  }

  return pool[Math.floor(Math.random() * pool.length)]!;
}
