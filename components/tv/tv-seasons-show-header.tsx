import Image from 'next/image';
import Link from 'next/link';

import { formatAirRange, formatAvgEpisodeRuntime } from '@/lib/tv-helpers';
import type { TvDetails } from '@services/tmdb/tv/schema';
import { ArrowLeft, Star } from 'lucide-react';

type TvSeasonsShowHeaderProps = {
  show: TvDetails;
  seriesId: number;
};

function scoreText(voteAverage: number, voteCount: number) {
  if (voteCount < 1) return null;
  return voteAverage.toFixed(1);
}

export function TvSeasonsShowHeader({ show, seriesId }: TvSeasonsShowHeaderProps) {
  const air = formatAirRange(show);
  const avgEp = formatAvgEpisodeRuntime(show.episode_run_time);
  const score = scoreText(show.vote_average, show.vote_count);
  return (
    <header className="border-b border-zinc-800/90 pb-8">
      <Link
        href={`/tv/${seriesId}`}
        className="inline-flex items-center gap-1.5 text-sm text-amber-300/90 transition-colors hover:text-amber-200"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to series
      </Link>
      <div className="mt-6 flex flex-col gap-6 md:flex-row md:gap-8 lg:gap-10">
        <div className="relative mx-auto aspect-2/3 w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800 sm:mx-0 sm:max-w-[240px]">
          <Image
            src={show.posterUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 220px, 240px"
            priority
          />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            {show.name}
          </h1>
          {show.original_name && show.original_name !== show.name && (
            <p className="mt-1 text-sm text-zinc-500">{show.original_name}</p>
          )}
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-zinc-300">
            {air && <li>{air}</li>}
            {show.status && <li className="text-zinc-400">{show.status}</li>}
            {typeof show.number_of_seasons === 'number' && show.number_of_seasons > 0 && (
              <li>
                {show.number_of_seasons} season{show.number_of_seasons === 1 ? '' : 's'}
              </li>
            )}
            {typeof show.number_of_episodes === 'number' && show.number_of_episodes > 0 && (
              <li>{show.number_of_episodes} episodes</li>
            )}
            {avgEp && <li>{avgEp}</li>}
            {score && (
              <li className="inline-flex items-center gap-1 font-medium text-amber-300">
                <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                <span className="tabular-nums">{score}</span>
                <span className="text-xs font-normal text-zinc-500">/10</span>
              </li>
            )}
          </ul>
          {show.genres.length > 0 && (
            <p className="mt-2 text-sm text-zinc-400">
              {show.genres.map((g) => g.name).join(' · ')}
            </p>
          )}
          {show.overview?.trim() && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              {show.overview.trim()}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
