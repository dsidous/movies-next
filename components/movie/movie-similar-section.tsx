import { MediaCard } from '@/components/media/media-card';
import { MediaRow } from '@/components/media/media-row';
import { cn } from '@/lib/utils';
import type { MovieListItem } from '@services/tmdb/movie/schema';

const ROW_CAP = 18;

type MovieSimilarSectionProps = {
  title?: string;
  items: MovieListItem[];
  className?: string;
};

export function MovieSimilarSection({
  title = 'More like this',
  items,
  className,
}: MovieSimilarSectionProps) {
  const slice = items.slice(0, ROW_CAP);
  if (slice.length === 0) return null;

  return (
    <div className={cn('text-zinc-100', className)}>
      <MediaRow title={title} className="[&>h2]:text-zinc-100">
        {slice.map((m) => (
          <MediaCard
            key={m.id}
            id={m.id}
            type="movie"
            title={m.title}
            year={m.releaseYear}
            posterUrl={m.posterUrl}
            voteAverage={m.vote_average}
            voteCount={m.vote_count}
          />
        ))}
      </MediaRow>
    </div>
  );
}
