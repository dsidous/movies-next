import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { MovieDetails } from '@services/tmdb/movie/schema';
import { Plus, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { formatRuntime } from './movie-helpers';

type MovieHeroProps = {
  movie: MovieDetails;
  className?: string;
};

/** TMDb user average (0–10); null if no votes. */
function userScore(voteAverage: number, voteCount: number) {
  if (voteCount < 1) return null;
  return voteAverage.toFixed(1);
}

export function MovieHero({ movie, className }: MovieHeroProps) {
  const bg = movie.backdropUrl ?? movie.posterUrl;
  const year = movie.release_date ? movie.release_date.split('-')[0] : null;
  const runtime = formatRuntime(movie.runtime);
  const score = userScore(movie.vote_average, movie.vote_count);
  return (
    <section
      className={cn(
        'relative isolate flex w-full min-h-[60svh] flex-col overflow-hidden sm:min-h-[65svh]',
        className,
      )}
      aria-label={movie.title}
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

      {/* Top ~70% stays clear; bottom fades to page background (zinc-950) */}
      <div
        className="absolute inset-0 z-1 bg-[linear-gradient(to_bottom,transparent_0%,transparent_70%,var(--color-zinc-950)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col justify-end px-4 pb-15 pt-8 sm:px-5 sm:pb-21 sm:pt-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.9)] sm:text-4xl md:text-5xl lg:text-6xl">
          {movie.title}
        </h1>
        {movie.tagline && (
          <p className="mt-2 text-lg font-medium text-zinc-200/95 italic [text-shadow:0_1px_12px_rgb(0_0_0/0.85)] sm:text-xl">
            {movie.tagline}
          </p>
        )}

        <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-200/95 [text-shadow:0_1px_8px_rgb(0_0_0/0.85)] sm:text-base">
          {year && <li>{year}</li>}
          {runtime && <li>{runtime}</li>}
          {movie.genres.length > 0 && (
            <li className="text-zinc-300">{movie.genres.map((g) => g.name).join(' · ')}</li>
          )}
          {score && (
            <li className="inline-flex max-w-full items-baseline font-medium">
              <span
                className="inline-flex items-center gap-1 text-amber-300 [text-shadow:0_0_1px_rgba(0,0,0,0.88),0_0_8px_rgba(0,0,0,0.65)]"
                title="Average user score on TMDb"
              >
                <Star
                  className="size-4 shrink-0 fill-amber-400 text-amber-400"
                  aria-hidden
                />
                <span className="tabular-nums">{score}</span>
                <span className="text-xs font-normal text-zinc-300/90">/10</span>
              </span>
            </li>
          )}
        </ul>

        {movie.overview && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-100/95 [text-shadow:0_1px_10px_rgb(0_0_0/0.88)] sm:mt-5 sm:text-base">
            {movie.overview}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            className="border-zinc-600 bg-zinc-800/80 text-white hover:bg-zinc-700/90"
          >
            <Plus className="size-5" aria-hidden />
            My List
          </Button>
        </div>
      </div>
    </section>
  );
}
