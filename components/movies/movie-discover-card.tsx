import Image from 'next/image';
import Link from 'next/link';

import type { MovieListItem } from '@services/tmdb';

import { cn } from '@/lib/utils';
import { Calendar, Globe2, Star, TrendingUp } from 'lucide-react';

function genreLabels(ids: number[], genreMap: Map<number, string>): string[] {
  return ids.map((id) => genreMap.get(id)).filter((x): x is string => Boolean(x));
}

type MovieDiscoverCardProps = {
  movie: MovieListItem;
  genreMap: Map<number, string>;
  className?: string;
};

export function MovieDiscoverCard({ movie, genreMap, className }: MovieDiscoverCardProps) {
  const genres = genreLabels(movie.genre_ids, genreMap);
  const overview =
    movie.overview?.trim() ||
    'No overview available yet — open the title for full details.';
  const hasRating =
    typeof movie.vote_count === 'number' &&
    movie.vote_count > 0 &&
    typeof movie.vote_average === 'number';

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <Link
        href={`/movie/${movie.id}`}
        className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <div className="space-y-1">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground md:text-lg">
              {movie.title}
            </h2>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {movie.releaseYear ? (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="size-3 opacity-80" aria-hidden />
                  {movie.releaseYear}
                </span>
              ) : null}
              {movie.original_language ? (
                <span className="inline-flex items-center gap-1 uppercase">
                  <Globe2 className="size-3 opacity-80" aria-hidden />
                  {movie.original_language}
                </span>
              ) : null}
            </p>
          </div>
          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Genres">
              {genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  role="listitem"
                  className="rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {g}
                </span>
              ))}
              {genres.length > 3 ? (
                <span className="text-[11px] text-muted-foreground">+{genres.length - 3}</span>
              ) : null}
            </div>
          ) : null}
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{overview}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {hasRating ? (
              <span className="inline-flex items-center gap-1 tabular-nums" title="Average vote">
                <Star className="size-3.5 text-amber-500" aria-hidden />
                {movie.vote_average.toFixed(1)}
                <span className="text-muted-foreground/80">({movie.vote_count.toLocaleString()})</span>
              </span>
            ) : (
              <span className="text-muted-foreground/80">No score yet</span>
            )}
            <span className="inline-flex items-center gap-1" title="Popularity">
              <TrendingUp className="size-3.5 opacity-80" aria-hidden />
              {movie.popularity.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
