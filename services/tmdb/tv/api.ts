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
import { tvEndpoints } from './endpoints';
import type {
  TvDetails,
  TvDetailsRow,
  TvDetailsWithAppends,
  TvEpisode,
  TvEpisodeRow,
  TvListItem,
  TvListItemRow,
  TvNetworkDisplay,
  TvSeason,
  TvSeasonRow,
} from './schema';
import {
  TrendingTvResponseSchema,
  TvAccountStatesSchema,
  TvAggregateCreditsResponseSchema,
  TvAiringTodayResponseSchema,
  TvAlternativeTitlesResponseSchema,
  TvContentRatingsResponseSchema,
  TvCreditsSchema,
  TvDetailsRowSchema,
  TvEpisodeChangesResponseSchema,
  TvEpisodeGroupDetailsSchema,
  TvEpisodeGroupsResponseSchema,
  TvEpisodeRowSchema,
  TvExternalIdsSchema,
  TvIdChangesResponseSchema,
  TvImagesResponseSchema,
  TvKeywordsResponseSchema,
  TvListChangesResponseSchema,
  TvOnTheAirResponseSchema,
  TvPopularResponseSchema,
  TvPublicListsResponseSchema,
  TvRecommendationsResponseSchema,
  TvReviewsResponseSchema,
  TvScreenedTheatricallyResponseSchema,
  TvSeasonChangesResponseSchema,
  TvSeasonRowSchema,
  TvSimilarResponseSchema,
  TvTopRatedResponseSchema,
  TvTranslationsResponseSchema,
  TvVideosResponseSchema,
  TvWatchProvidersResponseSchema,
} from './schema';

type Paged = { page?: number };
type PagedWithRegion = Paged & { region?: string };
type ListQuery = Paged;
type IdChangesPathQuery = { end_date?: string; start_date?: string } & Paged;
type PagedListQuery = { page?: number };
type QueryRecord = Record<string, string | number | boolean | null | undefined>;

const TTL_SHORT = 60 * 60; // 1h  — lists that change frequently
const TTL_LONG = 60 * 60 * 24; // 24h — detail/static data

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a parsed TV list row to the UI shape (no raw `*_path` blobs). */
export function toTvListItem(item: TvListItemRow, imageBaseUrl: string): TvListItem {
  return {
    id: item.id,
    name: item.name,
    overview: item.overview,
    genre_ids: item.genre_ids,
    origin_country: item.origin_country,
    original_language: item.original_language,
    original_name: item.original_name,
    popularity: item.popularity,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    posterUrl: formatImageUrlWithBase(item.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: item.backdrop_path
      ? formatImageUrlWithBase(item.backdrop_path, imageBaseUrl, 'original')
      : null,
    firstAirYear: item.first_air_date ? item.first_air_date.split('-')[0]! : '',
  };
}

function mapSeasonsForUi(seasons: unknown[] | undefined) {
  if (!seasons?.length) return [];
  const out: {
    season_number: number;
    name: string;
    episode_count: number;
    air_date: string | null;
  }[] = [];
  for (const s of seasons) {
    if (s == null || typeof s !== 'object') continue;
    const o = s as Record<string, unknown>;
    const sn = o.season_number;
    if (typeof sn !== 'number' || !Number.isFinite(sn)) continue;
    const name = typeof o.name === 'string' ? o.name : `Season ${sn}`;
    const ec = o.episode_count;
    const episode_count = typeof ec === 'number' && Number.isFinite(ec) ? ec : 0;
    const ad = o.air_date;
    const air_date = typeof ad === 'string' && ad.length > 0 ? ad : null;
    out.push({ season_number: sn, name, episode_count, air_date });
  }
  return out.sort((a, b) => a.season_number - b.season_number);
}

function mapLastEpisodeToAirUi(raw: unknown | null | undefined): { season_number: number } | null {
  if (raw == null || typeof raw !== 'object') return null;
  const sn = (raw as Record<string, unknown>).season_number;
  return typeof sn === 'number' && sn >= 0 ? { season_number: sn } : null;
}

function mapDisplayNetworks(
  networks: unknown[] | undefined,
  imageBaseUrl: string,
): TvNetworkDisplay[] {
  if (!networks?.length) return [];
  const out: TvNetworkDisplay[] = [];
  for (const n of networks) {
    if (n == null || typeof n !== 'object') continue;
    const o = n as Record<string, unknown>;
    const id = typeof o.id === 'number' ? o.id : 0;
    const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'Network';
    const path = o.logo_path;
    const logoPath = typeof path === 'string' && path.length > 0 ? path : null;
    out.push({
      id,
      name,
      logoUrl: logoPath ? formatImageUrlWithBase(logoPath, imageBaseUrl, 'w185') : null,
    });
  }
  return out;
}

function toTvDetails(row: TvDetailsRow, imageBaseUrl: string): TvDetails {
  return {
    id: row.id,
    name: row.name,
    original_name: row.original_name,
    overview: row.overview,
    tagline: row.tagline,
    vote_average: row.vote_average,
    vote_count: row.vote_count,
    genres: row.genres,
    first_air_date: row.first_air_date,
    last_air_date: row.last_air_date,
    episode_run_time: row.episode_run_time,
    number_of_seasons: row.number_of_seasons,
    number_of_episodes: row.number_of_episodes,
    seasons: mapSeasonsForUi(row.seasons),
    last_episode_to_air: mapLastEpisodeToAirUi(row.last_episode_to_air),
    posterUrl: formatImageUrlWithBase(row.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: row.backdrop_path
      ? formatImageUrlWithBase(row.backdrop_path, imageBaseUrl, 'original')
      : null,
    firstAirYear: row.first_air_date ? row.first_air_date.split('-')[0]! : '',
    displayNetworks: mapDisplayNetworks(row.networks, imageBaseUrl),
    status: row.status,
  };
}

function enrichTvSeason(row: TvSeasonRow, imageBaseUrl: string): TvSeason {
  return {
    ...row,
    posterUrl: row.poster_path
      ? formatImageUrlWithBase(row.poster_path, imageBaseUrl, 'w500')
      : null,
  };
}

function enrichTvEpisode(row: TvEpisodeRow, imageBaseUrl: string): TvEpisode {
  return {
    ...row,
    stillUrl: row.still_path
      ? formatImageUrlWithBase(row.still_path, imageBaseUrl, 'original')
      : null,
  };
}

// ---------------------------------------------------------------------------
// Global list endpoints — no cache (change logs / latest)
// ---------------------------------------------------------------------------

export async function getTvListChanges(params?: {
  end_date?: string;
  start_date?: string;
  page?: number;
}) {
  const data = await tmdbFetch<z.input<typeof TvListChangesResponseSchema>>(
    tmdbPath(tvEndpoints.changes, params as QueryRecord),
  );
  return TvListChangesResponseSchema.parse(data);
}

export async function getLatestTv() {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvDetailsRowSchema>>(tvEndpoints.latest),
    getConfiguration(),
  ]);
  return toTvDetails(TvDetailsRowSchema.parse(data), images.imageBaseUrl);
}

// ---------------------------------------------------------------------------
// Frequently-changing lists (TTL_SHORT — 1h)
// ---------------------------------------------------------------------------

export const getAiringTodayTv = unstable_cache(
  async (params?: Paged & { language?: string; timezone?: string }) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvAiringTodayResponseSchema>>(
        tmdbPath(tvEndpoints.airingToday, params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvAiringTodayResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-airing-today'],
  { revalidate: TTL_SHORT },
);

export const getOnTheAirTv = unstable_cache(
  async (params?: PagedWithRegion) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvOnTheAirResponseSchema>>(
        tmdbPath(tvEndpoints.onTheAir, params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvOnTheAirResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-on-the-air'],
  { revalidate: TTL_SHORT },
);

export const getPopularTv = unstable_cache(
  async (params?: PagedWithRegion) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvPopularResponseSchema>>(
        tmdbPath(tvEndpoints.popular, params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvPopularResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-popular'],
  { revalidate: TTL_SHORT },
);

export const getTopRatedTv = unstable_cache(
  async (params?: PagedWithRegion) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvTopRatedResponseSchema>>(
        tmdbPath(tvEndpoints.topRated, params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvTopRatedResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-top-rated'],
  { revalidate: TTL_SHORT },
);

export const getTrendingTv = unstable_cache(
  async (time: 'day' | 'week', params?: PagedListQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TrendingTvResponseSchema>>(
        tmdbPath(tvEndpoints.trending(time), params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TrendingTvResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-trending'],
  { revalidate: TTL_SHORT },
);

// ---------------------------------------------------------------------------
// TV series detail endpoints (TTL_LONG — 24h)
// ---------------------------------------------------------------------------

/**
 * TV series details. `include` maps to TMDB `append_to_response` (e.g. `videos`, `images`, `aggregate_credits`).
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export const getTv = unstable_cache(
  async (
    seriesId: number,
    params?: DetailIncludeQuery & {
      include_image_language?: string;
      language?: string;
    },
  ): Promise<TvDetailsWithAppends> => {
    const [raw, { images }] = await Promise.all([
      tmdbFetch<Record<string, unknown>>(
        tmdbPathWithInclude(tvEndpoints.details(seriesId), params),
      ),
      getConfiguration(),
    ]);
    const row = TvDetailsRowSchema.parse(raw);
    const base = images.imageBaseUrl;
    const show: TvDetailsWithAppends = {
      ...toTvDetails(row, base),
    };
    if (raw.videos != null && typeof raw.videos === 'object') {
      const p = TvVideosResponseSchema.safeParse(raw.videos);
      if (p.success) {
        show.videos = {
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
      const p = TvCreditsSchema.safeParse(raw.credits);
      if (p.success) {
        show.credits = {
          cast: p.data.cast.map((c) => ({
            id: c.id,
            credit_id: c.credit_id,
            name: c.name,
            character: c.character,
            profile_path: c.profile_path ?? null,
          })),
        };
      }
    }
    if (raw.similar != null && typeof raw.similar === 'object') {
      const p = TvSimilarResponseSchema.safeParse(raw.similar);
      if (p.success) {
        show.similar = {
          ...p.data,
          results: p.data.results.map((r) => toTvListItem(r, base)),
        };
      }
    }
    return show;
  },
  ['tmdb-tv-details'],
  { revalidate: TTL_LONG },
);

export const getTvAlternativeTitles = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvAlternativeTitlesResponseSchema>>(
      tvEndpoints.alternativeTitles(seriesId),
    );
    return TvAlternativeTitlesResponseSchema.parse(data);
  },
  ['tmdb-tv-alternative-titles'],
  { revalidate: TTL_LONG },
);

export const getTvAggregateCredits = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvAggregateCreditsResponseSchema>>(
      tvEndpoints.aggregateCredits(seriesId),
    );
    return TvAggregateCreditsResponseSchema.parse(data);
  },
  ['tmdb-tv-aggregate-credits'],
  { revalidate: TTL_LONG },
);

export const getTvCredits = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(tvEndpoints.credits(seriesId));
    return TvCreditsSchema.parse(data);
  },
  ['tmdb-tv-credits'],
  { revalidate: TTL_LONG },
);

export const getTvContentRatings = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvContentRatingsResponseSchema>>(
      tvEndpoints.contentRatings(seriesId),
    );
    return TvContentRatingsResponseSchema.parse(data);
  },
  ['tmdb-tv-content-ratings'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeGroups = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvEpisodeGroupsResponseSchema>>(
      tvEndpoints.episodeGroups(seriesId),
    );
    return TvEpisodeGroupsResponseSchema.parse(data);
  },
  ['tmdb-tv-episode-groups'],
  { revalidate: TTL_LONG },
);

export const getTvExternalIds = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
      tvEndpoints.externalIds(seriesId),
    );
    return TvExternalIdsSchema.parse(data);
  },
  ['tmdb-tv-external-ids'],
  { revalidate: TTL_LONG },
);

export const getTvImages = unstable_cache(
  async (seriesId: number, params?: { include_image_language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
      tmdbPath(tvEndpoints.images(seriesId), params as QueryRecord),
    );
    return TvImagesResponseSchema.parse(data);
  },
  ['tmdb-tv-images'],
  { revalidate: TTL_LONG },
);

export const getTvKeywords = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvKeywordsResponseSchema>>(
      tvEndpoints.keywords(seriesId),
    );
    return TvKeywordsResponseSchema.parse(data);
  },
  ['tmdb-tv-keywords'],
  { revalidate: TTL_LONG },
);

export const getTvPublicLists = unstable_cache(
  async (seriesId: number, params?: ListQuery & { language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvPublicListsResponseSchema>>(
      tmdbPath(tvEndpoints.lists(seriesId), params as QueryRecord),
    );
    return TvPublicListsResponseSchema.parse(data);
  },
  ['tmdb-tv-public-lists'],
  { revalidate: TTL_LONG },
);

export const getTvRecommendations = unstable_cache(
  async (seriesId: number, params?: ListQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvRecommendationsResponseSchema>>(
        tmdbPath(tvEndpoints.recommendations(seriesId), params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvRecommendationsResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-recommendations'],
  { revalidate: TTL_LONG },
);

export const getTvReviews = unstable_cache(
  async (seriesId: number, params?: { page?: number; language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvReviewsResponseSchema>>(
      tmdbPath(tvEndpoints.reviews(seriesId), params as QueryRecord),
    );
    return TvReviewsResponseSchema.parse(data);
  },
  ['tmdb-tv-reviews'],
  { revalidate: TTL_LONG },
);

export const getTvScreenedTheatrically = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvScreenedTheatricallyResponseSchema>>(
      tvEndpoints.screenedTheatrically(seriesId),
    );
    return TvScreenedTheatricallyResponseSchema.parse(data);
  },
  ['tmdb-tv-screened-theatrically'],
  { revalidate: TTL_LONG },
);

export const getTvSimilar = unstable_cache(
  async (seriesId: number, params?: ListQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvSimilarResponseSchema>>(
        tmdbPath(tvEndpoints.similar(seriesId), params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = TvSimilarResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => toTvListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-tv-similar'],
  { revalidate: TTL_LONG },
);

export const getTvTranslations = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
      tvEndpoints.translations(seriesId),
    );
    return TvTranslationsResponseSchema.parse(data);
  },
  ['tmdb-tv-translations'],
  { revalidate: TTL_LONG },
);

export const getTvVideos = unstable_cache(
  async (seriesId: number, params?: { language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
      tmdbPath(tvEndpoints.videos(seriesId), params as QueryRecord),
    );
    return TvVideosResponseSchema.parse(data);
  },
  ['tmdb-tv-videos'],
  { revalidate: TTL_LONG },
);

export const getTvWatchProviders = unstable_cache(
  async (seriesId: number) => {
    const data = await tmdbFetch<z.input<typeof TvWatchProvidersResponseSchema>>(
      tvEndpoints.watchProviders(seriesId),
    );
    return TvWatchProvidersResponseSchema.parse(data);
  },
  ['tmdb-tv-watch-providers'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeGroupDetails = unstable_cache(
  async (tvEpisodeGroupId: string) => {
    const data = await tmdbFetch<z.input<typeof TvEpisodeGroupDetailsSchema>>(
      tvEndpoints.episodeGroup(tvEpisodeGroupId),
    );
    return TvEpisodeGroupDetailsSchema.parse(data);
  },
  ['tmdb-tv-episode-group-details'],
  { revalidate: TTL_LONG },
);

// ---------------------------------------------------------------------------
// Season endpoints (TTL_LONG — 24h)
// ---------------------------------------------------------------------------

/**
 * TV season details. `include` maps to TMDB `append_to_response`.
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export const getTvSeason = unstable_cache(
  async (
    seriesId: number,
    seasonNumber: number,
    params?: DetailIncludeQuery & { language?: string },
  ) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvSeasonRowSchema>>(
        tmdbPathWithInclude(tvEndpoints.season(seriesId, seasonNumber), params),
      ),
      getConfiguration(),
    ]);
    const row = TvSeasonRowSchema.parse(data);
    const base = images.imageBaseUrl;
    return {
      ...enrichTvSeason(row, base),
      episodes: row.episodes?.map((e) => enrichTvEpisode(e, base)),
    };
  },
  ['tmdb-tv-season'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonAggregateCredits = unstable_cache(
  async (seriesId: number, seasonNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvAggregateCreditsResponseSchema>>(
      tvEndpoints.seasonAggregateCredits(seriesId, seasonNumber),
    );
    return TvAggregateCreditsResponseSchema.parse(data);
  },
  ['tmdb-tv-season-aggregate-credits'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonCredits = unstable_cache(
  async (seriesId: number, seasonNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(
      tvEndpoints.seasonCredits(seriesId, seasonNumber),
    );
    return TvCreditsSchema.parse(data);
  },
  ['tmdb-tv-season-credits'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonExternalIds = unstable_cache(
  async (seriesId: number, seasonNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
      tvEndpoints.seasonExternalIds(seriesId, seasonNumber),
    );
    return TvExternalIdsSchema.parse(data);
  },
  ['tmdb-tv-season-external-ids'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonImages = unstable_cache(
  async (seriesId: number, seasonNumber: number, params?: { include_image_language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
      tmdbPath(tvEndpoints.seasonImages(seriesId, seasonNumber), params as QueryRecord),
    );
    return TvImagesResponseSchema.parse(data);
  },
  ['tmdb-tv-season-images'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonTranslations = unstable_cache(
  async (seriesId: number, seasonNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
      tvEndpoints.seasonTranslations(seriesId, seasonNumber),
    );
    return TvTranslationsResponseSchema.parse(data);
  },
  ['tmdb-tv-season-translations'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonVideos = unstable_cache(
  async (seriesId: number, seasonNumber: number, params?: { language?: string }) => {
    const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
      tmdbPath(tvEndpoints.seasonVideos(seriesId, seasonNumber), params as QueryRecord),
    );
    return TvVideosResponseSchema.parse(data);
  },
  ['tmdb-tv-season-videos'],
  { revalidate: TTL_LONG },
);

export const getTvSeasonWatchProviders = unstable_cache(
  async (seriesId: number, seasonNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvWatchProvidersResponseSchema>>(
      tvEndpoints.seasonWatchProviders(seriesId, seasonNumber),
    );
    return TvWatchProvidersResponseSchema.parse(data);
  },
  ['tmdb-tv-season-watch-providers'],
  { revalidate: TTL_LONG },
);

// ---------------------------------------------------------------------------
// Episode endpoints (TTL_LONG — 24h)
// ---------------------------------------------------------------------------

/**
 * TV episode details. `include` maps to TMDB `append_to_response`.
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export const getTvEpisode = unstable_cache(
  async (
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    params?: DetailIncludeQuery,
  ) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof TvEpisodeRowSchema>>(
        tmdbPathWithInclude(tvEndpoints.episode(seriesId, seasonNumber, episodeNumber), params),
      ),
      getConfiguration(),
    ]);
    return enrichTvEpisode(TvEpisodeRowSchema.parse(data), images.imageBaseUrl);
  },
  ['tmdb-tv-episode'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeCredits = unstable_cache(
  async (seriesId: number, seasonNumber: number, episodeNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(
      tvEndpoints.episodeCredits(seriesId, seasonNumber, episodeNumber),
    );
    return TvCreditsSchema.parse(data);
  },
  ['tmdb-tv-episode-credits'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeExternalIds = unstable_cache(
  async (seriesId: number, seasonNumber: number, episodeNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
      tvEndpoints.episodeExternalIds(seriesId, seasonNumber, episodeNumber),
    );
    return TvExternalIdsSchema.parse(data);
  },
  ['tmdb-tv-episode-external-ids'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeImages = unstable_cache(
  async (seriesId: number, seasonNumber: number, episodeNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
      tvEndpoints.episodeImages(seriesId, seasonNumber, episodeNumber),
    );
    return TvImagesResponseSchema.parse(data);
  },
  ['tmdb-tv-episode-images'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeTranslations = unstable_cache(
  async (seriesId: number, seasonNumber: number, episodeNumber: number) => {
    const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
      tvEndpoints.episodeTranslations(seriesId, seasonNumber, episodeNumber),
    );
    return TvTranslationsResponseSchema.parse(data);
  },
  ['tmdb-tv-episode-translations'],
  { revalidate: TTL_LONG },
);

export const getTvEpisodeVideos = unstable_cache(
  async (
    seriesId: number,
    seasonNumber: number,
    episodeNumber: number,
    params?: { language?: string },
  ) => {
    const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
      tmdbPath(
        tvEndpoints.episodeVideos(seriesId, seasonNumber, episodeNumber),
        params as QueryRecord,
      ),
    );
    return TvVideosResponseSchema.parse(data);
  },
  ['tmdb-tv-episode-videos'],
  { revalidate: TTL_LONG },
);

// ---------------------------------------------------------------------------
// User-specific — never cache
// ---------------------------------------------------------------------------

export async function getTvAccountStates(
  seriesId: number,
  params?: { session_id?: string; guest_session_id?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvAccountStatesSchema>>(
    tmdbPath(tvEndpoints.accountStates(seriesId), params as QueryRecord),
  );
  return TvAccountStatesSchema.parse(data);
}

export async function getTvSeasonAccountStates(
  seriesId: number,
  seasonNumber: number,
  params?: { session_id?: string; guest_session_id?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvAccountStatesSchema>>(
    tmdbPath(tvEndpoints.seasonAccountStates(seriesId, seasonNumber), params as QueryRecord),
  );
  return TvAccountStatesSchema.parse(data);
}

export async function getTvEpisodeAccountStates(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  params?: { session_id?: string; guest_session_id?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvAccountStatesSchema>>(
    tmdbPath(
      tvEndpoints.episodeAccountStates(seriesId, seasonNumber, episodeNumber),
      params as QueryRecord,
    ),
  );
  return TvAccountStatesSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Not cached — change logs are time-specific
// ---------------------------------------------------------------------------

export async function getTvIdChanges(seriesId: number, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof TvIdChangesResponseSchema>>(
    tmdbPath(tvEndpoints.itemChanges(seriesId), params as QueryRecord),
  );
  return TvIdChangesResponseSchema.parse(data);
}

export async function getTvSeasonChanges(seasonId: string, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof TvSeasonChangesResponseSchema>>(
    tmdbPath(tvEndpoints.seasonChanges(seasonId), params as QueryRecord),
  );
  return TvSeasonChangesResponseSchema.parse(data);
}

export async function getTvEpisodeChanges(episodeId: string, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof TvEpisodeChangesResponseSchema>>(
    tmdbPath(tvEndpoints.episodeChanges(episodeId), params as QueryRecord),
  );
  return TvEpisodeChangesResponseSchema.parse(data);
}
