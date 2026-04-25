import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { enrichCastForDisplay, getConfiguration, getTv, getTvSeason } from '@services/tmdb';

import { getLatestSeasonNumber, parseTmdbIdParam } from '@/lib/tv-helpers';
import { MovieCastSection } from '@/components/movie/movie-cast-section';
import {
  prepareVideosForUi,
} from '@/components/movie/movie-helpers';
import { MovieVideosSection } from '@/components/movie/movie-videos-section';
import { TvHero } from '@/components/tv/tv-hero';
import { TvLatestSeasonSection } from '@/components/tv/tv-latest-season-section';
import { TvSimilarSection } from '@/components/tv/tv-similar-section';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseTmdbIdParam(raw);
  if (id == null) return { title: 'TV' };
  try {
    const show = await getTv(id);
    return {
      title: `${show.name} | Movie Search`,
      description: show.overview?.trim().slice(0, 180) || `Details for ${show.name}`,
    };
  } catch {
    return { title: 'TV' };
  }
}

export default async function TvDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = parseTmdbIdParam(raw);
  if (id == null) notFound();

  const base = await Promise.all([
    getTv(id, { include: ['videos', 'credits', 'similar'] }),
    getConfiguration(),
  ]).catch(() => null);

  if (base === null) notFound();

  const [show, { images }] = base;
  const { imageBaseUrl } = images;

  const latestN = getLatestSeasonNumber(show);
  let latestSeason = null;
  if (latestN != null) {
    try {
      latestSeason = await getTvSeason(id, latestN);
    } catch {
      latestSeason = null;
    }
  }

  const similarResults = show.similar?.results ?? [];
  const videos = prepareVideosForUi(show.videos?.results ?? []);
  const cast = enrichCastForDisplay(show.credits?.cast, imageBaseUrl);

  return (
    <div className="min-h-screen bg-zinc-950 pb-10 text-zinc-100">
      <TvHero show={show} seriesId={id} />
      <div className="w-full min-w-0 space-y-8 px-4 pt-4 sm:space-y-10 sm:px-5 sm:pt-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {latestSeason && (
          <TvLatestSeasonSection seriesId={id} season={latestSeason} />
        )}
        <MovieVideosSection videos={videos} />
        <MovieCastSection cast={cast} />
        <TvSimilarSection items={similarResults} />
      </div>
    </div>
  );
}
