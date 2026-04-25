import { z } from 'zod';

import { getConfiguration } from '../configuration/api';
import { tmdbFetch } from '../client';
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
  TvNetworkDisplay,
  TvEpisode,
  TvEpisodeRow,
  TvListItem,
  TvListItemRow,
  TvSeason,
  TvSeasonRow,
} from './schema';
import {
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
  TrendingTvResponseSchema,
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

function enrichTvListItem(item: TvListItemRow, imageBaseUrl: string): TvListItem {
  return {
    ...item,
    posterUrl: formatImageUrlWithBase(item.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: item.backdrop_path
      ? formatImageUrlWithBase(item.backdrop_path, imageBaseUrl, 'original')
      : null,
    firstAirYear: item.first_air_date ? item.first_air_date.split('-')[0]! : '',
  };
}

function mapDisplayNetworks(
  networks: TvDetailsRow['networks'],
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

function enrichTvDetails(row: TvDetailsRow, imageBaseUrl: string): TvDetails {
  return {
    ...row,
    posterUrl: formatImageUrlWithBase(row.poster_path, imageBaseUrl, 'w500'),
    backdropUrl: row.backdrop_path
      ? formatImageUrlWithBase(row.backdrop_path, imageBaseUrl, 'original')
      : null,
    firstAirYear: row.first_air_date ? row.first_air_date.split('-')[0]! : '',
    displayNetworks: mapDisplayNetworks(row.networks, imageBaseUrl),
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

// --- /tv (global) — GET
export async function getTvListChanges(params?: { end_date?: string; start_date?: string; page?: number }) {
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
  return enrichTvDetails(TvDetailsRowSchema.parse(data), images.imageBaseUrl);
}

export async function getAiringTodayTv(
  params?: Paged & { language?: string; timezone?: string },
) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvAiringTodayResponseSchema>>(
      tmdbPath(tvEndpoints.airingToday, params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvAiringTodayResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getOnTheAirTv(params?: PagedWithRegion) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvOnTheAirResponseSchema>>(
      tmdbPath(tvEndpoints.onTheAir, params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvOnTheAirResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getPopularTv(params?: PagedWithRegion) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvPopularResponseSchema>>(
      tmdbPath(tvEndpoints.popular, params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvPopularResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getTopRatedTv(params?: PagedWithRegion) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvTopRatedResponseSchema>>(
      tmdbPath(tvEndpoints.topRated, params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvTopRatedResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getTrendingTv(time: 'day' | 'week', params?: PagedListQuery) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TrendingTvResponseSchema>>(
      tmdbPath(tvEndpoints.trending(time), params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TrendingTvResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

// --- /tv/{series_id} — GET
/**
 * TV series details. `include` maps to TMDB `append_to_response` (e.g. `videos`, `images`, `aggregate_credits`).
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export async function getTv(
  seriesId: number,
  params?: DetailIncludeQuery & {
    include_image_language?: string;
    language?: string;
  },
): Promise<TvDetailsWithAppends> {
  const [raw, { images }] = await Promise.all([
    tmdbFetch<Record<string, unknown>>(
      tmdbPathWithInclude(tvEndpoints.details(seriesId), params),
    ),
    getConfiguration(),
  ]);
  const row = TvDetailsRowSchema.parse(raw);
  const base = images.imageBaseUrl;
  const show: TvDetailsWithAppends = {
    ...enrichTvDetails(row, base),
  };
  if (raw.videos != null && typeof raw.videos === 'object') {
    const p = TvVideosResponseSchema.safeParse(raw.videos);
    if (p.success) show.videos = p.data;
  }
  if (raw.credits != null && typeof raw.credits === 'object') {
    const p = TvCreditsSchema.safeParse(raw.credits);
    if (p.success) show.credits = p.data;
  }
  if (raw.similar != null && typeof raw.similar === 'object') {
    const p = TvSimilarResponseSchema.safeParse(raw.similar);
    if (p.success) {
      show.similar = {
        ...p.data,
        results: p.data.results.map((r) => enrichTvListItem(r, base)),
      };
    }
  }
  return show;
}

export async function getTvAccountStates(
  seriesId: number,
  params?: { session_id?: string; guest_session_id?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvAccountStatesSchema>>(
    tmdbPath(tvEndpoints.accountStates(seriesId), params as QueryRecord),
  );
  return TvAccountStatesSchema.parse(data);
}

export async function getTvAlternativeTitles(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvAlternativeTitlesResponseSchema>>(
    tvEndpoints.alternativeTitles(seriesId),
  );
  return TvAlternativeTitlesResponseSchema.parse(data);
}

export async function getTvIdChanges(seriesId: number, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof TvIdChangesResponseSchema>>(
    tmdbPath(tvEndpoints.itemChanges(seriesId), params as QueryRecord),
  );
  return TvIdChangesResponseSchema.parse(data);
}

export async function getTvAggregateCredits(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvAggregateCreditsResponseSchema>>(
    tvEndpoints.aggregateCredits(seriesId),
  );
  return TvAggregateCreditsResponseSchema.parse(data);
}

export async function getTvCredits(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(tvEndpoints.credits(seriesId));
  return TvCreditsSchema.parse(data);
}

export async function getTvContentRatings(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvContentRatingsResponseSchema>>(
    tvEndpoints.contentRatings(seriesId),
  );
  return TvContentRatingsResponseSchema.parse(data);
}

export async function getTvEpisodeGroups(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvEpisodeGroupsResponseSchema>>(
    tvEndpoints.episodeGroups(seriesId),
  );
  return TvEpisodeGroupsResponseSchema.parse(data);
}

export async function getTvExternalIds(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
    tvEndpoints.externalIds(seriesId),
  );
  return TvExternalIdsSchema.parse(data);
}

export async function getTvImages(seriesId: number, params?: { include_image_language?: string }) {
  const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
    tmdbPath(tvEndpoints.images(seriesId), params as QueryRecord),
  );
  return TvImagesResponseSchema.parse(data);
}

export async function getTvKeywords(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvKeywordsResponseSchema>>(
    tvEndpoints.keywords(seriesId),
  );
  return TvKeywordsResponseSchema.parse(data);
}

export async function getTvPublicLists(
  seriesId: number,
  params?: ListQuery & { language?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvPublicListsResponseSchema>>(
    tmdbPath(tvEndpoints.lists(seriesId), params as QueryRecord),
  );
  return TvPublicListsResponseSchema.parse(data);
}

export async function getTvRecommendations(seriesId: number, params?: ListQuery) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvRecommendationsResponseSchema>>(
      tmdbPath(tvEndpoints.recommendations(seriesId), params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvRecommendationsResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getTvReviews(
  seriesId: number,
  params?: { page?: number; language?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvReviewsResponseSchema>>(
    tmdbPath(tvEndpoints.reviews(seriesId), params as QueryRecord),
  );
  return TvReviewsResponseSchema.parse(data);
}

export async function getTvScreenedTheatrically(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvScreenedTheatricallyResponseSchema>>(
    tvEndpoints.screenedTheatrically(seriesId),
  );
  return TvScreenedTheatricallyResponseSchema.parse(data);
}

export async function getTvSimilar(seriesId: number, params?: ListQuery) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvSimilarResponseSchema>>(
      tmdbPath(tvEndpoints.similar(seriesId), params as QueryRecord),
    ),
    getConfiguration(),
  ]);
  const parsed = TvSimilarResponseSchema.parse(data);
  return { ...parsed, results: parsed.results.map((r) => enrichTvListItem(r, images.imageBaseUrl)) };
}

export async function getTvTranslations(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
    tvEndpoints.translations(seriesId),
  );
  return TvTranslationsResponseSchema.parse(data);
}

export async function getTvVideos(seriesId: number, params?: { language?: string }) {
  const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
    tmdbPath(tvEndpoints.videos(seriesId), params as QueryRecord),
  );
  return TvVideosResponseSchema.parse(data);
}

export async function getTvWatchProviders(seriesId: number) {
  const data = await tmdbFetch<z.input<typeof TvWatchProvidersResponseSchema>>(
    tvEndpoints.watchProviders(seriesId),
  );
  return TvWatchProvidersResponseSchema.parse(data);
}

/**
 * TV season details. `include` maps to TMDB `append_to_response`.
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export async function getTvSeason(
  seriesId: number,
  seasonNumber: number,
  params?: DetailIncludeQuery & { language?: string },
) {
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

export async function getTvSeasonAggregateCredits(seriesId: number, seasonNumber: number) {
  const data = await tmdbFetch<z.input<typeof TvAggregateCreditsResponseSchema>>(
    tvEndpoints.seasonAggregateCredits(seriesId, seasonNumber),
  );
  return TvAggregateCreditsResponseSchema.parse(data);
}

export async function getTvSeasonCredits(seriesId: number, seasonNumber: number) {
  const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(
    tvEndpoints.seasonCredits(seriesId, seasonNumber),
  );
  return TvCreditsSchema.parse(data);
}

export async function getTvSeasonExternalIds(seriesId: number, seasonNumber: number) {
  const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
    tvEndpoints.seasonExternalIds(seriesId, seasonNumber),
  );
  return TvExternalIdsSchema.parse(data);
}

export async function getTvSeasonImages(
  seriesId: number,
  seasonNumber: number,
  params?: { include_image_language?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
    tmdbPath(tvEndpoints.seasonImages(seriesId, seasonNumber), params as QueryRecord),
  );
  return TvImagesResponseSchema.parse(data);
}

export async function getTvSeasonTranslations(
  seriesId: number,
  seasonNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
    tvEndpoints.seasonTranslations(seriesId, seasonNumber),
  );
  return TvTranslationsResponseSchema.parse(data);
}

export async function getTvSeasonVideos(
  seriesId: number,
  seasonNumber: number,
  params?: { language?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
    tmdbPath(tvEndpoints.seasonVideos(seriesId, seasonNumber), params as QueryRecord),
  );
  return TvVideosResponseSchema.parse(data);
}

export async function getTvSeasonWatchProviders(
  seriesId: number,
  seasonNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvWatchProvidersResponseSchema>>(
    tvEndpoints.seasonWatchProviders(seriesId, seasonNumber),
  );
  return TvWatchProvidersResponseSchema.parse(data);
}

/**
 * TV episode details. `include` maps to TMDB `append_to_response`.
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export async function getTvEpisode(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  params?: DetailIncludeQuery,
) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof TvEpisodeRowSchema>>(
      tmdbPathWithInclude(
        tvEndpoints.episode(seriesId, seasonNumber, episodeNumber),
        params,
      ),
    ),
    getConfiguration(),
  ]);
  return enrichTvEpisode(TvEpisodeRowSchema.parse(data), images.imageBaseUrl);
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

export async function getTvEpisodeCredits(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvCreditsSchema>>(
    tvEndpoints.episodeCredits(seriesId, seasonNumber, episodeNumber),
  );
  return TvCreditsSchema.parse(data);
}

export async function getTvEpisodeExternalIds(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvExternalIdsSchema>>(
    tvEndpoints.episodeExternalIds(seriesId, seasonNumber, episodeNumber),
  );
  return TvExternalIdsSchema.parse(data);
}

export async function getTvEpisodeImages(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvImagesResponseSchema>>(
    tvEndpoints.episodeImages(seriesId, seasonNumber, episodeNumber),
  );
  return TvImagesResponseSchema.parse(data);
}

export async function getTvEpisodeTranslations(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
) {
  const data = await tmdbFetch<z.input<typeof TvTranslationsResponseSchema>>(
    tvEndpoints.episodeTranslations(seriesId, seasonNumber, episodeNumber),
  );
  return TvTranslationsResponseSchema.parse(data);
}

export async function getTvEpisodeVideos(
  seriesId: number,
  seasonNumber: number,
  episodeNumber: number,
  params?: { language?: string },
) {
  const data = await tmdbFetch<z.input<typeof TvVideosResponseSchema>>(
    tmdbPath(
      tvEndpoints.episodeVideos(seriesId, seasonNumber, episodeNumber),
      params as QueryRecord,
    ),
  );
  return TvVideosResponseSchema.parse(data);
}

export async function getTvEpisodeGroupDetails(tvEpisodeGroupId: string) {
  const data = await tmdbFetch<z.input<typeof TvEpisodeGroupDetailsSchema>>(
    tvEndpoints.episodeGroup(tvEpisodeGroupId),
  );
  return TvEpisodeGroupDetailsSchema.parse(data);
}

export async function getTvSeasonChanges(
  seasonId: string,
  params?: IdChangesPathQuery,
) {
  const data = await tmdbFetch<z.input<typeof TvSeasonChangesResponseSchema>>(
    tmdbPath(tvEndpoints.seasonChanges(seasonId), params as QueryRecord),
  );
  return TvSeasonChangesResponseSchema.parse(data);
}

export async function getTvEpisodeChanges(
  episodeId: string,
  params?: IdChangesPathQuery,
) {
  const data = await tmdbFetch<z.input<typeof TvEpisodeChangesResponseSchema>>(
    tmdbPath(tvEndpoints.episodeChanges(episodeId), params as QueryRecord),
  );
  return TvEpisodeChangesResponseSchema.parse(data);
}
