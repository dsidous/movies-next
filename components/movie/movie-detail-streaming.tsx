import { watchlistLookupKey } from '@/lib/watchlist-key';
import { getWatchlistedKeys } from '@/lib/watchlisted-keys';
import type { MovieListItem } from '@services/tmdb/movie/schema';

import { Skeleton } from '@/components/ui/skeleton';
import { HeroMyListButton } from '@/components/watchlist/hero-my-list-button';

import { MovieSimilarSection } from './movie-similar-section';

export function MovieHeroMyListFallback() {
  return (
    <Skeleton
      className="h-10 w-42 rounded-md border border-white/20 bg-white/10 shadow-lg sm:h-11"
      aria-hidden
    />
  );
}

export async function MovieHeroMyListServer({
  movieId,
  title,
}: {
  movieId: number;
  title: string;
}) {
  const keys = await getWatchlistedKeys();
  const saved = keys.includes(watchlistLookupKey('movie', movieId));
  return (
    <HeroMyListButton
      mediaType="movie"
      mediaId={String(movieId)}
      title={title}
      initialIsSaved={saved}
    />
  );
}

export function MovieSimilarSectionFallback({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="h-8 w-40 rounded-md bg-zinc-800" aria-hidden />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-32 shrink-0 rounded-md bg-zinc-800 sm:h-52 sm:w-36" />
        ))}
      </div>
    </div>
  );
}

export async function MovieSimilarWithWatchlistServer({ items }: { items: MovieListItem[] }) {
  const keys = await getWatchlistedKeys();
  return <MovieSimilarSection items={items} watchlistedKeys={keys} />;
}
