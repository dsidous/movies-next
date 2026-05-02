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
import { personEndpoints } from './endpoints';
import type {
  PersonCreditCardItem,
  PersonDetails,
  PersonDetailsRow,
  PersonPopularListItem,
  PersonPopularListItemRow,
} from './schema';
import {
  PersonCreditsResponseSchema,
  PersonDetailsRowSchema,
  PersonExternalIdsSchema,
  PersonIdChangesResponseSchema,
  PersonImagesResponseSchema,
  PersonListChangesResponseSchema,
  PersonPopularResponseSchema,
  PersonTaggedImagesResponseSchema,
  PersonTranslationsResponseSchema,
} from './schema';

type Paged = { page?: number };
type IdChangesPathQuery = { end_date?: string; start_date?: string } & Paged;
type QueryRecord = Record<string, string | number | boolean | null | undefined>;

const TTL_SHORT = 60 * 60; // 1h  — popular list changes regularly
const TTL_LONG = 60 * 60 * 24; // 24h — person details/credits/images are stable

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function enrichPersonProfile(
  row: { profile_path?: string | null },
  imageBaseUrl: string,
): { profileUrl: string } {
  return {
    profileUrl: formatImageUrlWithBase(row.profile_path ?? null, imageBaseUrl, 'w500'),
  };
}

function enrichPersonListItem(
  row: PersonPopularListItemRow,
  imageBaseUrl: string,
): PersonPopularListItem {
  return {
    ...row,
    ...enrichPersonProfile(row, imageBaseUrl),
  };
}

function enrichPersonDetails(row: PersonDetailsRow, imageBaseUrl: string): PersonDetails {
  return {
    ...row,
    ...enrichPersonProfile(row, imageBaseUrl),
  };
}

// ---------------------------------------------------------------------------
// Global list endpoints — no cache (change logs / latest)
// ---------------------------------------------------------------------------

export async function getPersonListChanges(params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof PersonListChangesResponseSchema>>(
    tmdbPath(personEndpoints.changes, params as QueryRecord),
  );
  return PersonListChangesResponseSchema.parse(data);
}

export async function getLatestPerson() {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof PersonDetailsRowSchema>>(personEndpoints.latest),
    getConfiguration(),
  ]);
  return enrichPersonDetails(PersonDetailsRowSchema.parse(data), images.imageBaseUrl);
}

// ---------------------------------------------------------------------------
// Frequently-changing lists (TTL_SHORT — 1h)
// ---------------------------------------------------------------------------

export const getPopularPeople = unstable_cache(
  async (params?: Paged) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof PersonPopularResponseSchema>>(
        tmdbPath(personEndpoints.popular, params as QueryRecord),
      ),
      getConfiguration(),
    ]);
    const parsed = PersonPopularResponseSchema.parse(data);
    return {
      ...parsed,
      results: parsed.results.map((r) => enrichPersonListItem(r, images.imageBaseUrl)),
    };
  },
  ['tmdb-popular-people'],
  { revalidate: TTL_SHORT },
);

// ---------------------------------------------------------------------------
// Person detail endpoints (TTL_LONG — 24h)
// ---------------------------------------------------------------------------

/**
 * Person details. `include` maps to TMDB `append_to_response` (e.g. `images`, `movie_credits`, `tv_credits`, `combined_credits`, `tagged_images`).
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export const getPerson = unstable_cache(
  async (personId: number, params?: DetailIncludeQuery) => {
    const [data, { images }] = await Promise.all([
      tmdbFetch<z.input<typeof PersonDetailsRowSchema>>(
        tmdbPathWithInclude(personEndpoints.details(personId), params),
      ),
      getConfiguration(),
    ]);
    return enrichPersonDetails(PersonDetailsRowSchema.parse(data), images.imageBaseUrl);
  },
  ['tmdb-person-details'],
  { revalidate: TTL_LONG },
);

export const getPersonCombinedCredits = unstable_cache(
  async (personId: number) => {
    const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
      personEndpoints.combinedCredits(personId),
    );
    return PersonCreditsResponseSchema.parse(data);
  },
  ['tmdb-person-combined-credits'],
  { revalidate: TTL_LONG },
);

export const getPersonExternalIds = unstable_cache(
  async (personId: number) => {
    const data = await tmdbFetch<z.input<typeof PersonExternalIdsSchema>>(
      personEndpoints.externalIds(personId),
    );
    return PersonExternalIdsSchema.parse(data);
  },
  ['tmdb-person-external-ids'],
  { revalidate: TTL_LONG },
);

export const getPersonImages = unstable_cache(
  async (personId: number, params?: { include_image_language?: string }) => {
    const data = await tmdbFetch<z.input<typeof PersonImagesResponseSchema>>(
      tmdbPath(personEndpoints.images(personId), params as QueryRecord),
    );
    return PersonImagesResponseSchema.parse(data);
  },
  ['tmdb-person-images'],
  { revalidate: TTL_LONG },
);

export const getPersonMovieCredits = unstable_cache(
  async (personId: number) => {
    const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
      personEndpoints.movieCredits(personId),
    );
    return PersonCreditsResponseSchema.parse(data);
  },
  ['tmdb-person-movie-credits'],
  { revalidate: TTL_LONG },
);

export const getPersonTaggedImages = unstable_cache(
  async (personId: number, params?: Paged) => {
    const data = await tmdbFetch<z.input<typeof PersonTaggedImagesResponseSchema>>(
      tmdbPath(personEndpoints.taggedImages(personId), params as QueryRecord),
    );
    return PersonTaggedImagesResponseSchema.parse(data);
  },
  ['tmdb-person-tagged-images'],
  { revalidate: TTL_LONG },
);

export const getPersonTranslations = unstable_cache(
  async (personId: number) => {
    const data = await tmdbFetch<z.input<typeof PersonTranslationsResponseSchema>>(
      personEndpoints.translations(personId),
    );
    return PersonTranslationsResponseSchema.parse(data);
  },
  ['tmdb-person-translations'],
  { revalidate: TTL_LONG },
);

export const getPersonTvCredits = unstable_cache(
  async (personId: number) => {
    const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
      personEndpoints.tvCredits(personId),
    );
    return PersonCreditsResponseSchema.parse(data);
  },
  ['tmdb-person-tv-credits'],
  { revalidate: TTL_LONG },
);

// ---------------------------------------------------------------------------
// Not cached — change logs are time-specific
// ---------------------------------------------------------------------------

export async function getPersonIdChanges(personId: number, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof PersonIdChangesResponseSchema>>(
    tmdbPath(personEndpoints.itemChanges(personId), params as QueryRecord),
  );
  return PersonIdChangesResponseSchema.parse(data);
}

// ---------------------------------------------------------------------------
// Pure client-side display helper — no fetch, no cache needed
// ---------------------------------------------------------------------------

const CREDIT_DISPLAY_LIMIT = 60;

type RawCombinedCast = Record<string, unknown>;

function creditTitle(c: RawCombinedCast) {
  const t = c.title;
  const n = c.name;
  if (typeof t === 'string' && t.length) return t;
  if (typeof n === 'string' && n.length) return n;
  return 'Untitled';
}

function creditYear(c: RawCombinedCast) {
  const rel = c.release_date;
  const first = c.first_air_date;
  const raw =
    typeof rel === 'string' && rel ? rel : typeof first === 'string' && first ? first : '';
  if (!raw) return '';
  return raw.split('-')[0] ?? '';
}

export function enrichPersonCombinedCastForDisplay(
  cast: unknown[] | undefined,
  imageBaseUrl: string,
  options?: { limit?: number },
): PersonCreditCardItem[] {
  if (!cast?.length) return [];
  const limit = options?.limit ?? CREDIT_DISPLAY_LIMIT;
  const seen = new Set<string>();
  const rows: PersonCreditCardItem[] = [];

  for (const raw of cast) {
    if (rows.length >= limit) break;
    if (!raw || typeof raw !== 'object') continue;
    const c = raw as RawCombinedCast;
    const id = c.id;
    const media = c.media_type;
    if (typeof id !== 'number' || (media !== 'movie' && media !== 'tv')) continue;
    const key = `${String(media)}-${id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const va = c.vote_average;
    const vc = c.vote_count;
    const ch = c.character;
    const poster = c.poster_path;

    rows.push({
      id,
      type: media,
      title: creditTitle(c),
      year: creditYear(c),
      posterUrl: formatImageUrlWithBase(
        typeof poster === 'string' ? poster : null,
        imageBaseUrl,
        'w500',
      ),
      character: typeof ch === 'string' ? ch : '',
      vote_average: typeof va === 'number' ? va : 0,
      vote_count: typeof vc === 'number' ? vc : 0,
    });
  }

  rows.sort((a, b) => {
    const yb = b.year ? parseInt(b.year, 10) : 0;
    const ya = a.year ? parseInt(a.year, 10) : 0;
    if (yb !== ya) return yb - ya;
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });

  return rows;
}
