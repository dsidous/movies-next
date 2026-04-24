import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { enrichCastForDisplay, getConfiguration, getMovie } from '@services/tmdb';

import { MovieCastSection } from '@/components/movie/movie-cast-section';
import {
  parseMovieIdParam,
  prepareVideosForUi,
} from '@/components/movie/movie-helpers';
import { MovieHero } from '@/components/movie/movie-hero';
import { MovieSimilarSection } from '@/components/movie/movie-similar-section';
import { MovieVideosSection } from '@/components/movie/movie-videos-section';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseMovieIdParam(raw);
  if (id == null) return { title: 'Movie' };
  try {
    const movie = await getMovie(id);
    return {
      title: `${movie.title} | Movie Search`,
      description: movie.overview?.trim().slice(0, 180) || `Details for ${movie.title}`,
    };
  } catch {
    return { title: 'Movie' };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id: raw } = await params;
  const id = parseMovieIdParam(raw);
  if (id == null) notFound();

  const data = await Promise.all([
    getMovie(id, { include: ['videos', 'credits', 'similar'] }),
    getConfiguration(),
  ]).catch(() => null);

  if (data === null) notFound();

  const [movie, { images }] = data;
  const { imageBaseUrl } = images;

  const videos = prepareVideosForUi(movie.videos?.results ?? []);
  const cast = enrichCastForDisplay(movie.credits?.cast, imageBaseUrl);
  const similarResults = movie.similar?.results ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 pb-10 text-zinc-100">
      <MovieHero movie={movie} />
      <div className="w-full min-w-0 space-y-8 px-4 pt-4 sm:space-y-10 sm:px-5 sm:pt-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <MovieVideosSection videos={videos} />
        <MovieCastSection cast={cast} />
        <MovieSimilarSection items={similarResults} />
      </div>
    </div>
  );
}
