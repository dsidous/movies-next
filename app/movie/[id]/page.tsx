import { Suspense } from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_NAME } from '@/lib/constants/site';
import { enrichCastForDisplay, getConfiguration, getMovie, getMovieReviews } from '@services/tmdb';

import { MovieCastSection } from '@/components/movie/movie-cast-section';
import {
  MovieHeroMyListFallback,
  MovieHeroMyListServer,
  MovieSimilarSectionFallback,
  MovieSimilarWithWatchlistServer,
} from '@/components/movie/movie-detail-streaming';
import { parseMovieIdParam, prepareVideosForUi } from '@/components/movie/movie-helpers';
import { MovieHero } from '@/components/movie/movie-hero';
import { MovieVideosSection } from '@/components/movie/movie-videos-section';
import { MediaReviewsSection } from '@/components/media/media-reviews-section';

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
      title: `${movie.title} | ${SITE_NAME}`,
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

  let movie: Awaited<ReturnType<typeof getMovie>>;
  let reviews: Awaited<ReturnType<typeof getMovieReviews>> | null = null;
  let imageBaseUrl: string;
  try {
    const [movieResult, config, reviewsResult] = await Promise.all([
      getMovie(id, { include: ['videos', 'credits', 'similar'] }),
      getConfiguration(),
      getMovieReviews(id).catch(() => null),
    ]);
    movie = movieResult;
    imageBaseUrl = config.images.imageBaseUrl;
    reviews = reviewsResult;
  } catch {
    notFound();
  }

  const videos = prepareVideosForUi(movie.videos?.results ?? []);
  const cast = enrichCastForDisplay(movie.credits?.cast, imageBaseUrl);
  const similarResults = movie.similar?.results ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 pb-10 text-zinc-100">
      <MovieHero
        movie={movie}
        listButton={
          <Suspense fallback={<MovieHeroMyListFallback />}>
            <MovieHeroMyListServer movieId={id} title={movie.title} />
          </Suspense>
        }
      />
      <div className="w-full min-w-0 space-y-8 px-4 pt-4 sm:space-y-10 sm:px-5 sm:pt-6 md:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <MovieVideosSection videos={videos} />
        <MovieCastSection cast={cast} />
        <MediaReviewsSection
          media="movie"
          mediaId={id}
          reviews={reviews}
          imageBaseUrl={imageBaseUrl}
        />
        <Suspense fallback={<MovieSimilarSectionFallback />}>
          <MovieSimilarWithWatchlistServer items={similarResults} />
        </Suspense>
      </div>
    </div>
  );
}
