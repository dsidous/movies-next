import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { TvEpisode, TvSeason } from '@services/tmdb/tv/schema';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const PREVIEW_MAX = 6;

type TvLatestSeasonSectionProps = {
  seriesId: number;
  season: TvSeason & { episodes?: TvEpisode[] };
  className?: string;
};

function formatAir(iso: string | null | undefined) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(t);
}

export function TvLatestSeasonSection({ seriesId, season, className }: TvLatestSeasonSectionProps) {
  const year =
    season.air_date && season.air_date.length >= 4 ? season.air_date.slice(0, 4) : null;
  const episodes = season.episodes ?? [];
  const preview = episodes.slice(0, PREVIEW_MAX);
  const more = Math.max(0, episodes.length - preview.length);
  return (
    <section className={cn('min-w-0', className)} aria-labelledby="tv-latest-season-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="tv-latest-season-heading"
          className="text-base font-semibold tracking-tight text-zinc-100 sm:text-lg"
        >
          Latest: {season.name}
          {year ? (
            <span className="font-normal text-zinc-400"> · {year}</span>
          ) : null}
        </h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-auto w-fit self-start p-0 text-amber-300/90 hover:bg-transparent hover:text-amber-200"
        >
          <Link
            href={`/tv/${seriesId}/seasons`}
            className="inline-flex items-center gap-1 text-sm sm:text-base"
          >
            View all seasons
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
      {season.overview?.trim() && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
          {season.overview.trim()}
        </p>
      )}
      {episodes.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No episode list available for this season.</p>
      ) : (
        <ol className="mt-4 space-y-0 divide-y divide-zinc-800 rounded-md border border-zinc-800 bg-zinc-900/30">
          {preview.map((ep) => {
            const sub = [formatAir(ep.air_date), ep.runtime ? `${ep.runtime}m` : null]
              .filter(Boolean)
              .join(' · ');
            return (
              <li
                key={ep.id}
                className="flex gap-3 p-3 sm:gap-4 sm:px-4 sm:py-3"
              >
                <div
                  className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-zinc-800 sm:h-14 sm:w-24"
                  aria-hidden
                >
                  {ep.stillUrl != null && ep.stillUrl !== '' ? (
                    <Image
                      src={ep.stillUrl as string}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    <span className="text-zinc-500">E{ep.episode_number}.</span>{' '}
                    {ep.name}
                  </p>
                  {sub ? (
                    <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">{sub}</p>
                  ) : null}
                  {ep.overview?.trim() ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400 sm:text-sm">
                      {ep.overview.trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {more > 0 && (
        <p className="mt-2 text-sm text-zinc-500">
          +{more} more episode{more === 1 ? '' : 's'} — open{' '}
          <Link
            className="text-amber-300/90 underline-offset-2 hover:underline"
            href={`/tv/${seriesId}/seasons`}
          >
            all seasons
          </Link>{' '}
          to browse every episode.
        </p>
      )}
    </section>
  );
}
