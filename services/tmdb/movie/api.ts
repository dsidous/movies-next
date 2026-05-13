import { unstable_cache } from 'next/cache';

import { z } from 'zod';

import { tmdbFetch } from '../client';
import { getConfiguration } from '../configuration/api';
import {
  type DetailIncludeQuery,
  formatImageUrlWithBase,
  tmdbPath,
  tmdbPathWithInclude,
} from '../utils';
import { movieEndpoints } from './endpoints';
import type {
  CastDisplayItem,
  CreditsCastForDisplay,
  MovieDetails,
  MovieDetailsRow,
  MovieDetailsWithAppends,
  MovieListItem,
  MovieListItemRow,
} from './schema';
import {
  MovieAccountStatesSchema,
  MovieAlternativeTitlesResponseSchema,
  MovieCreditsSchema,
  MovieDetailsRowSchema,
  MovieExternalIdsSchema,
  MovieIdChangesResponseSchema,
  MovieImagesResponseSchema,
  MovieKeywordsResponseSchema,
  MovieListChangesResponseSchema,
  MoviePublicListsResponseSchema,
  mapTmdbAppendedCreditsCast,
  MovieRecommendationsResponseSchema,
  MovieReleaseDatesResponseSchema,
  MovieReviewsResponseSchema,
  MovieTranslationsResponseSchema,
  MovieVideosResponseSchema,
  MovieWatchProvidersResponseSchema,
  NowPlayingResponseSchema,
  PopularResponseSchema,
  SimilarMoviesResponseSchema,
  TopRatedResponseSchema,
  TrendingMoviesResponseSchema,
  UpcomingResponseSchema,
} from './schema';

type Paged = { page?: number };
type PagedWithRegion = Paged & { region?: string };
type ListMovieIdQuery = Paged;
type MovieIdChangesPathQuery = { end_date?: string; start_date?: string } & Paged;
type PagedListQuery = { page?: number };

const TTL_SHORT = 60 * 60; // 1h  — lists that change frequently
const TTL_LONG = 60 * 60 * 24; // 24h — detail/static data

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a parsed list row to the UI shape (no raw `*_path` blobs). */
export function toMovieListItem(item: MovieListItemRow, imageBaseUrl: string): MovieListItem {
  return {
    id: item.id,
    title: item.title,
    overview: item.overview,
    genre_ids: item.genre_ids,
    original_language: item.original_language,
    popularity: item.popularity,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    posterUrl: formatImageUrlWithBase(item.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: item.backdrop_path
      ? formatImageUrlWithBase(item.backdrop_path, imageBaseUrl, 'original')
      : null,
    releaseYear: item.release_date ? item.release_date.split('-')[0]! : '',
  };
}

function toMovieDetails(row: MovieDetailsRow, imageBaseUrl: string): MovieDetails {
  return {
    id: row.id,
    title: row.title,
    overview: row.overview,
    release_date: row.release_date,
    runtime: row.runtime,
    vote_average: row.vote_average,
    vote_count: row.vote_count,
    genres: row.genres,
    tagline: row.tagline,
    posterUrl: formatImageUrlWithBase(row.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: row.backdrop_path
      ? formatImageUrlWithBase(row.backdrop_path, imageBaseUrl, 'original')
      : null,
    releaseYear: row.release_date ? row.release_date.split('-')[0]! : '',
  };
}

const DEFAULT_CAST_DISPLAY_LIMIT = 18;

export function enrichCastForDisplay(
  cast: CreditsCastForDisplay[] | undefined,
  imageBaseUrl: string,
  options?: { limit?: number },
): CastDisplayItem[] {
  if (!cast?.length) return [];
  const limit = options?.limit ?? DEFAULT_CAST_DISPLAY_LIMIT;
  return cast.slice(0, limit).map((c) => ({
    id: c.id,
    creditId: c.credit_id ?? `${c.id}-${c.name ?? ''}`,
    name: c.name ?? 'Unknown',
    character: c.character ?? '',
    profileUrl: c.profile_path
      ? formatImageUrlWithBase(c.profile_path, imageBaseUrl, 'w500')
      : null,
  }));
}

// ---------------------------------------------------------------------------
// Global list endpoints  (no cache — change logs / latest)
// ---------------------------------------------------------------------------

export async function getMovieListChanges(params?: {
  end_date?: string;
  start_date?: string;
  page?: number;
}) {
  const data = await tmdbFetch<z.input<typeof MovieListChangesResponseSchema>>(
    tmdbPath(movieEndpoints.changes, params),
  );
  return MovieListChangesResponseSchema.parse(data);
}

export async function getLatestMovie() {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof MovieDetailsRowSchema>>(movieEndpoints.latest),
    getConfiguration(),
  ]);
  return toMovieDetails(MovieDetailsRowSchema.parse(data), images.imageBaseUrl);
}

// ---------------------------------------------------------------------------
// Frequently-changing lists  (TTL_SHORT — 1h)
// ---------------------------------------------------------------------------

export const getNowPlayingMovies = unstable_cache(
  async (
    params?: PagedWithRegion & {
      language?: string;
      'release_date.lte'?: string;
      'release_date.gte'?: string;
    },
  ) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof NowPlayingResponseSchema>>(
        tmdbPath(
          movieEndpoints.nowPlaying,
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = NowPlayingResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-now-playing'],
  { revalidate: TTL_SHORT },
);

export const getPopularMovies = unstable_cache(
  async (params?: PagedWithRegion) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof PopularResponseSchema>>(
        tmdbPath(
          movieEndpoints.popular,
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = PopularResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-popular-movies'],
  { revalidate: TTL_SHORT },
);

export const getTopRatedMovies = unstable_cache(
  async (params?: PagedWithRegion) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TopRatedResponseSchema>>(
        tmdbPath(
          movieEndpoints.topRated,
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = TopRatedResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-top-rated-movies'],
  { revalidate: TTL_SHORT },
);

export const getUpcomingMovies = unstable_cache(
  async (
    params?: PagedWithRegion & {
      language?: string;
      'release_date.lte'?: string;
      'release_date.gte'?: string;
      with_release_type?: string;
    },
  ) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof UpcomingResponseSchema>>(
        tmdbPath(
          movieEndpoints.upcoming,
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = UpcomingResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-upcoming-movies'],
  { revalidate: TTL_SHORT },
);

export const getTrendingMovies = unstable_cache(
  async (time: 'day' | 'week', params?: PagedListQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TrendingMoviesResponseSchema>>(
        tmdbPath(
          movieEndpoints.trending(time),
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = TrendingMoviesResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-trending-movies'],
  { revalidate: TTL_SHORT },
);

// ---------------------------------------------------------------------------
// Movie detail endpoints  (TTL_LONG — 24h)
// ---------------------------------------------------------------------------

export const getMovie = unstable_cache(
  async (
    id: number,
    params?: DetailIncludeQuery & {
      include_image_language?: string;
      language?: string;
    },
  ): Promise<MovieDetailsWithAppends> => {
    const [raw, { images }] = await Promise.all([
      tmdbFetch<Record<string, unknown>>(tmdbPathWithInclude(movieEndpoints.details(id), params)),
      getConfiguration(),
    ]);
    const row = MovieDetailsRowSchema.parse(raw);
    const movie: MovieDetailsWithAppends = {
      ...toMovieDetails(row, images.imageBaseUrl),
    };
    if (raw.videos != null && typeof raw.videos === 'object') {
      const p = MovieVideosResponseSchema.safeParse(raw.videos);
      if (p.success) {
        movie.videos = {
          results: p.data.results.map((v) => ({
            site: v.site ?? null,
            key: v.key ?? null,
            name: v.name ?? null,
            type: v.type ?? null,
          })),
        };
      }
    }
    if (raw.credits != null && typeof raw.credits === 'object') {
      const cast = mapTmdbAppendedCreditsCast(raw.credits);
      if (cast.length) {
        movie.credits = { cast };
      }
    }
    if (raw.similar != null && typeof raw.similar === 'object') {
      const p = SimilarMoviesResponseSchema.safeParse(raw.similar);
      if (p.success) {
        movie.similar = {
          ...p.data,
          results: p.data.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
        };
      }
    }
    return movie;
  },
  ['tmdb-movie-details'],
  { revalidate: TTL_LONG },
);

export const getMovieAlternativeTitles = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieAlternativeTitlesResponseSchema>>(
      movieEndpoints.alternativeTitles(id),
    );
    return MovieAlternativeTitlesResponseSchema.parse(data);
  },
  ['tmdb-movie-alternative-titles'],
  { revalidate: TTL_LONG },
);

export const getMovieCredits = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieCreditsSchema>>(movieEndpoints.credits(id));
    return MovieCreditsSchema.parse(data);
  },
  ['tmdb-movie-credits'],
  { revalidate: TTL_LONG },
);

export const getMovieExternalIds = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieExternalIdsSchema>>(
      movieEndpoints.externalIds(id),
    );
    return MovieExternalIdsSchema.parse(data);
  },
  ['tmdb-movie-external-ids'],
  { revalidate: TTL_LONG },
);

export const getMovieImages = unstable_cache(
  async (id: number, params?: { include_image_language?: string }) => {
    const data = await tmdbFetch<z.input<typeof MovieImagesResponseSchema>>(
      tmdbPath(
        movieEndpoints.images(id),
        params as Record<string, string | number | boolean | null | undefined>,
      ),
    );
    return MovieImagesResponseSchema.parse(data);
  },
  ['tmdb-movie-images'],
  { revalidate: TTL_LONG },
);

export const getMovieKeywords = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieKeywordsResponseSchema>>(
      movieEndpoints.keywords(id),
    );
    return MovieKeywordsResponseSchema.parse(data);
  },
  ['tmdb-movie-keywords'],
  { revalidate: TTL_LONG },
);

export const getMoviePublicLists = unstable_cache(
  async (id: number, params?: ListMovieIdQuery & { language?: string }) => {
    const data = await tmdbFetch<z.input<typeof MoviePublicListsResponseSchema>>(
      tmdbPath(
        movieEndpoints.lists(id),
        params as Record<string, string | number | boolean | null | undefined>,
      ),
    );
    return MoviePublicListsResponseSchema.parse(data);
  },
  ['tmdb-movie-public-lists'],
  { revalidate: TTL_LONG },
);

export const getMovieRecommendations = unstable_cache(
  async (id: number, params?: ListMovieIdQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof MovieRecommendationsResponseSchema>>(
        tmdbPath(
          movieEndpoints.recommendations(id),
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = MovieRecommendationsResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-movie-recommendations'],
  { revalidate: TTL_LONG },
);

export const getMovieReleaseDates = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieReleaseDatesResponseSchema>>(
      movieEndpoints.releaseDates(id),
    );
    return MovieReleaseDatesResponseSchema.parse(data);
  },
  ['tmdb-movie-release-dates'],
  { revalidate: TTL_LONG },
);

export const getMovieReviews = unstable_cache(
  async (id: number, params?: { page?: number; language?: string }) => {
    const data = await tmdbFetch<z.input<typeof MovieReviewsResponseSchema>>(
      tmdbPath(
        movieEndpoints.reviews(id),
        params as Record<string, string | number | boolean | null | undefined>,
      ),
    );
    return MovieReviewsResponseSchema.parse(data);
  },
  ['tmdb-movie-reviews'],
  { revalidate: TTL_LONG },
);

export const getMovieSimilar = unstable_cache(
  async (id: number, params?: ListMovieIdQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof SimilarMoviesResponseSchema>>(
        tmdbPath(
          movieEndpoints.similar(id),
          params as Record<string, string | number | boolean | null | undefined>,
        ),
      ),
      getConfiguration(),
    ]);
    const parsed = SimilarMoviesResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((row) => toMovieListItem(row, images.imageBaseUrl)),
    };
  },
  ['tmdb-movie-similar'],
  { revalidate: TTL_LONG },
);

export const getMovieTranslations = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieTranslationsResponseSchema>>(
      movieEndpoints.translations(id),
    );
    return MovieTranslationsResponseSchema.parse(data);
  },
  ['tmdb-movie-translations'],
  { revalidate: TTL_LONG },
);

export const getMovieVideos = unstable_cache(
  async (id: number, params?: { language?: string }) => {
    const data = await tmdbFetch<z.input<typeof MovieVideosResponseSchema>>(
      tmdbPath(
        movieEndpoints.videos(id),
        params as Record<string, string | number | boolean | null | undefined>,
      ),
    );
    return MovieVideosResponseSchema.parse(data);
  },
  ['tmdb-movie-videos'],
  { revalidate: TTL_LONG },
);

export const getMovieWatchProviders = unstable_cache(
  async (id: number) => {
    const data = await tmdbFetch<z.input<typeof MovieWatchProvidersResponseSchema>>(
      movieEndpoints.watchProviders(id),
    );
    return MovieWatchProvidersResponseSchema.parse(data);
  },
  ['tmdb-movie-watch-providers'],
  { revalidate: TTL_LONG },
);

// ---------------------------------------------------------------------------
// User-specific — never cache
// ---------------------------------------------------------------------------

export async function getMovieAccountStates(
  id: number,
  params?: { session_id?: string; guest_session_id?: string },
) {
  const data = await tmdbFetch<z.input<typeof MovieAccountStatesSchema>>(
    tmdbPath(
      movieEndpoints.accountStates(id),
      params as Record<string, string | number | boolean | null | undefined>,
    ),
  );
  return MovieAccountStatesSchema.parse(data);
}

// Not cached — changes data is time-specific and always different
export async function getMovieIdChanges(id: number, params?: MovieIdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof MovieIdChangesResponseSchema>>(
    tmdbPath(
      movieEndpoints.itemChanges(id),
      params as Record<string, string | number | boolean | null | undefined>,
    ),
  );
  return MovieIdChangesResponseSchema.parse(data);
}
