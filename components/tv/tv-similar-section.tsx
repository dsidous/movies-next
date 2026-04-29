import { MediaCard } from '@/components/media/media-card';
import { MediaRow } from '@/components/media/media-row';
import { watchlistLookupKey } from '@/lib/watchlist-key';
import { cn } from '@/lib/utils';
import type { TvListItem } from '@services/tmdb/tv/schema';

const ROW_CAP = 18;

type TvSimilarSectionProps = {
  title?: string;
  items: TvListItem[];
  watchlistedKeys: string[];
  className?: string;
};

export function TvSimilarSection({
  title = 'More like this',
  items,
  watchlistedKeys,
  className,
}: TvSimilarSectionProps) {
  const saved = new Set(watchlistedKeys);
  const slice = items.slice(0, ROW_CAP);
  if (slice.length === 0) return null;

  return (
    <div className={cn('text-zinc-100', className)}>
      <MediaRow title={title} className="[&>h2]:text-zinc-100">
        {slice.map((t) => (
          <MediaCard
            key={t.id}
            id={t.id}
            type="tv"
            title={t.name}
            year={t.firstAirYear}
            posterUrl={t.posterUrl}
            voteAverage={t.vote_average}
            voteCount={t.vote_count}
            isWatchlisted={saved.has(watchlistLookupKey('tv', t.id))}
          />
        ))}
      </MediaRow>
    </div>
  );
}
