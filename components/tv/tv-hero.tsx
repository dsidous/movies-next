import Image from 'next/image';
import Link from 'next/link';

import { formatAvgEpisodeRuntime, formatAirRange } from '@/lib/tv-helpers';
import { cn } from '@/lib/utils';
import type { TvDetails } from '@services/tmdb/tv/schema';
import { List, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HeroMyListButton } from '@/components/watchlist/hero-my-list-button';

type TvHeroProps = {
  show: TvDetails;
  seriesId: number;
  isWatchlisted: boolean;
  className?: string;
};

function userScore(voteAverage: number, voteCount: number) {
  if (voteCount < 1) return null;
  return voteAverage.toFixed(1);
}

export function TvHero({ show, seriesId, isWatchlisted, className }: TvHeroProps) {
  const bg = show.backdropUrl ?? show.posterUrl;
  const airRange = formatAirRange(show);
  const avgRun = formatAvgEpisodeRuntime(show.episode_run_time);
  const score = userScore(show.vote_average, show.vote_count);
  const status = show.status?.trim() ?? '';
  const nets = show.displayNetworks ?? [];
  return (
    <section
      className={cn(
        'relative isolate flex w-full flex-col overflow-hidden',
        'min-h-[min(32rem,75vh)] sm:min-h-[min(36rem,78vh)] lg:min-h-[min(40rem,80vh)]',
        className,
      )}
      aria-label={show.name}
    >
      {bg && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bg}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      )}

      <div
        className="absolute inset-0 z-1 bg-[linear-gradient(to_bottom,transparent_0%,transparent_70%,var(--color-zinc-950)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col justify-end px-4 pt-8 pb-15 sm:px-5 sm:pt-10 sm:pb-21 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {nets.length > 0 && (
          <ul
            className="mb-3 flex max-w-4xl flex-wrap items-center gap-3 sm:mb-4 sm:gap-4"
            aria-label="Networks"
          >
            {nets.map((n) => (
              <li key={`${n.id}-${n.name}`} className="flex h-7 items-center sm:h-8">
                {n.logoUrl ? (
                  <Image
                    src={n.logoUrl}
                    alt={n.name}
                    width={160}
                    height={40}
                    className="h-7 w-auto max-w-26 object-contain object-left sm:h-8 sm:max-w-30"
                    sizes="(max-width: 640px) 30vw, 120px"
                  />
                ) : (
                  <span className="rounded border border-white/20 bg-black/30 px-2 py-1 text-xs font-medium text-white/90 [text-shadow:0_1px_4px_rgb(0_0_0/0.8)] sm:text-sm">
                    {n.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.9)] sm:text-4xl md:text-5xl lg:text-6xl">
          {show.name}
        </h1>
        {show.tagline?.trim() ? (
          <p className="mt-2 text-lg font-medium text-zinc-200/95 italic [text-shadow:0_1px_12px_rgb(0_0_0/0.85)] sm:text-xl">
            {show.tagline.trim()}
          </p>
        ) : null}

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-200/95 [text-shadow:0_1px_8px_rgb(0_0_0/0.85)] sm:text-base">
          {airRange && <li>{airRange}</li>}
          {status && <li>{status}</li>}
          {show.genres.length > 0 && (
            <li className="text-zinc-300">{show.genres.map((g) => g.name).join(' · ')}</li>
          )}
          {avgRun && <li>{avgRun}</li>}
          {typeof show.number_of_seasons === 'number' && show.number_of_seasons > 0 && (
            <li>
              {show.number_of_seasons} season{show.number_of_seasons === 1 ? '' : 's'}
            </li>
          )}
          {score && (
            <li className="inline-flex max-w-full items-baseline font-medium">
              <span
                className="inline-flex items-center gap-1 text-amber-300 [text-shadow:0_0_1px_rgba(0,0,0,0.88),0_0_8px_rgba(0,0,0,0.65)]"
                title="Average user score on TMDb"
              >
                <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                <span className="tabular-nums">{score}</span>
                <span className="text-xs font-normal text-zinc-300/90">/10</span>
              </span>
            </li>
          )}
        </ul>

        {show.overview && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-100/95 [text-shadow:0_1px_10px_rgb(0_0_0/0.88)] sm:mt-5 sm:text-base">
            {show.overview}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
          <HeroMyListButton
            key={`tv-${seriesId}-${isWatchlisted}`}
            mediaType="tv"
            mediaId={String(seriesId)}
            title={show.name}
            initialIsSaved={isWatchlisted}
          />
          <Button
            asChild
            variant="secondary"
            className="border-zinc-600/80 bg-zinc-900/50 text-white hover:bg-zinc-800/80"
          >
            <Link
              href={`/tv/${seriesId}/seasons`}
              prefetch={false}
              className="inline-flex items-center gap-2"
            >
              <List className="size-4 shrink-0" aria-hidden />
              All seasons
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
