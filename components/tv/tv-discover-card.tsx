'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { TvListItem } from '@services/tmdb';

import { BookmarkButton } from '@/components/watchlist/bookmarkButton';
import { cn } from '@/lib/utils';
import { Calendar, Globe2, Star, TrendingUp } from 'lucide-react';

function genreLabels(ids: number[], genreMap: Map<number, string>): string[] {
  return ids.map((id) => genreMap.get(id)).filter((x): x is string => Boolean(x));
}

type TvDiscoverCardProps = {
  show: TvListItem;
  genreMap: Map<number, string>;
  isWatchlisted?: boolean;
  className?: string;
};

export function TvDiscoverCard({ show, genreMap, isWatchlisted = false, className }: TvDiscoverCardProps) {
  const genres = genreLabels(show.genre_ids, genreMap);
  const overview =
    show.overview?.trim() ||
    'No overview available yet — open the series for full details.';
  const hasRating =
    typeof show.vote_count === 'number' &&
    show.vote_count > 0 &&
    typeof show.vote_average === 'number';

  const origin =
    show.origin_country?.filter(Boolean).slice(0, 2).join(', ') ?? '';

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <Link
        href={`/tv/${show.id}`}
        prefetch={false}
        className="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-2/3 w-full overflow-hidden bg-muted">
          <BookmarkButton
            key={`tv-${show.id}-${isWatchlisted}`}
            mediaType="tv"
            mediaId={String(show.id)}
            title={show.name}
            initialIsSaved={isWatchlisted}
          />
          <Image
            src={show.posterUrl}
            alt={show.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <div className="space-y-1">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground md:text-lg">
              {show.name}
            </h2>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {show.firstAirYear ? (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="size-3 opacity-80" aria-hidden />
                  {show.firstAirYear}
                </span>
              ) : null}
              {show.original_language ? (
                <span className="inline-flex items-center gap-1 uppercase">
                  <Globe2 className="size-3 opacity-80" aria-hidden />
                  {show.original_language}
                </span>
              ) : null}
              {origin ? (
                <span className="inline-flex max-w-full items-center gap-1 truncate" title={origin}>
                  <span className="opacity-80" aria-hidden>
                    ·
                  </span>
                  {origin}
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
                {show.vote_average.toFixed(1)}
                <span className="text-muted-foreground/80">({show.vote_count.toLocaleString()})</span>
              </span>
            ) : (
              <span className="text-muted-foreground/80">No score yet</span>
            )}
            <span className="inline-flex items-center gap-1" title="Popularity">
              <TrendingUp className="size-3.5 opacity-80" aria-hidden />
              {show.popularity.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
