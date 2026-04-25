import { MediaCard } from '@/components/media/media-card';
import { MediaRow } from '@/components/media/media-row';
import { cn } from '@/lib/utils';
import type { TvListItem } from '@services/tmdb/tv/schema';

const ROW_CAP = 18;

type TvSimilarSectionProps = {
  title?: string;
  items: TvListItem[];
  className?: string;
};

export function TvSimilarSection({
  title = 'More like this',
  items,
  className,
}: TvSimilarSectionProps) {
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
          />
        ))}
      </MediaRow>
    </div>
  );
}
