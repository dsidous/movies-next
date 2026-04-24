import Image from 'next/image';
import Link from 'next/link';

import type { HeroSpotlight } from '@/lib/pick-hero-spotlight';
import { cn } from '@/lib/utils';
import type { MovieListItem } from '@services/tmdb/movie/schema';
import type { TvListItem } from '@services/tmdb/tv/schema';

import { Button } from '@/components/ui/button';

type TrendingHeroProps = {
  spotlight: HeroSpotlight;
  className?: string;
};

function heroHref(s: HeroSpotlight) {
  return s.kind === 'movie' ? `/movie/${s.item.id}` : `/tv/${s.item.id}`;
}

function displayTitle(item: MovieListItem | TvListItem, kind: HeroSpotlight['kind']) {
  return kind === 'movie' ? (item as MovieListItem).title : (item as TvListItem).name;
}

function displayYear(item: MovieListItem | TvListItem, kind: HeroSpotlight['kind']) {
  return kind === 'movie' ? (item as MovieListItem).releaseYear : (item as TvListItem).firstAirYear;
}

export function TrendingHero({ spotlight, className }: TrendingHeroProps) {
  const { item, kind } = spotlight;
  const bg = item.backdropUrl ?? item.posterUrl;
  const title = displayTitle(item, kind);
  const year = displayYear(item, kind);
  const overview = item.overview?.trim() ?? '';
  const kindLabel = kind === 'movie' ? 'Movie' : 'Series';
  const href = heroHref(spotlight);

  return (
    <section
      className={cn(
        'relative isolate flex min-h-[min(32rem,75vh)] w-full flex-col justify-end sm:min-h-[min(36rem,78vh)] lg:min-h-[min(40rem,80vh)]',
        className,
      )}
      aria-label="Featured from trending"
    >
      {bg && (
        <Image src={bg} alt="" fill priority className="object-cover object-top" sizes="100vw" />
      )}

      {/* Light scrim: mostly show the artwork; only lift text contrast at the bottom */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_38%,rgb(0_0_0/0.28)_78%,rgb(0_0_0/0.45)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-y-0 left-0 w-full max-w-3xl bg-linear-to-r from-black/10 to-transparent sm:max-w-4xl"
        aria-hidden
      />

      <div className="relative z-10 w-full min-w-0 px-4 pt-24 pb-8 sm:px-5 sm:pt-28 sm:pb-10 md:px-6 md:pb-12 lg:px-8 xl:px-10 2xl:px-12">
        <p className="text-xs font-medium tracking-[0.2em] text-white/90 uppercase [text-shadow:0_1px_2px_rgb(0_0_0/0.45)] sm:text-sm">
          Trending
        </p>
        <h1 className="mt-1 max-w-4xl text-3xl font-bold tracking-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.5),0_4px_20px_rgb(0_0_0/0.35)] sm:text-4xl md:mt-2 md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.4)] sm:text-base">
          {kindLabel}
          {year ? ` · ${year}` : null}
        </p>
        {overview && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/95 [text-shadow:0_1px_2px_rgb(0_0_0/0.45)] sm:mt-4 sm:line-clamp-3 sm:text-base">
            {overview}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
          <Button asChild size="default" className="font-semibold text-zinc-950 shadow-lg">
            <Link href={href}>More info</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
