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
  PersonCombinedCastEntry,
  PersonCombinedCredits,
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

function enrichPersonListItem(
  row: PersonPopularListItemRow,
  imageBaseUrl: string,
): PersonPopularListItem {
  return {
    id: row.id,
    name: row.name,
    profileUrl: formatImageUrlWithBase(row.profile_path ?? null, imageBaseUrl, 'w500'),
    known_for_department: row.known_for_department,
  };
}

function enrichPersonDetails(row: PersonDetailsRow, imageBaseUrl: string): PersonDetails {
  return {
    id: row.id,
    name: row.name,
    known_for_department: row.known_for_department,
    biography: row.biography,
    birthday: row.birthday,
    deathday: row.deathday,
    place_of_birth: row.place_of_birth,
    profileUrl: formatImageUrlWithBase(row.profile_path ?? null, imageBaseUrl, 'w500'),
  };
}

function slimPersonCombinedCreditsCast(cast: unknown[]): PersonCombinedCastEntry[] {
  const out: PersonCombinedCastEntry[] = [];
  for (const raw of cast) {
    if (!raw || typeof raw !== 'object') continue;
    const o = raw as Record<string, unknown>;
    const id = o.id;
    const media = o.media_type;
    if (typeof id !== 'number' || (media !== 'movie' && media !== 'tv')) continue;
    out.push({
      id,
      media_type: media,
      title: typeof o.title === 'string' ? o.title : undefined,
      name: typeof o.name === 'string' ? o.name : undefined,
      release_date: typeof o.release_date === 'string' ? o.release_date : undefined,
      first_air_date: typeof o.first_air_date === 'string' ? o.first_air_date : undefined,
      poster_path:
        typeof o.poster_path === 'string'
          ? o.poster_path
          : o.poster_path === null
            ? null
            : undefined,
      character: typeof o.character === 'string' ? o.character : undefined,
      vote_average: typeof o.vote_average === 'number' ? o.vote_average : undefined,
      vote_count: typeof o.vote_count === 'number' ? o.vote_count : undefined,
    });
  }
  return out;
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
  async (personId: number): Promise<PersonCombinedCredits> => {
    const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
      personEndpoints.combinedCredits(personId),
    );
    const parsed = PersonCreditsResponseSchema.parse(data);
    return {
      id: parsed.id,
      cast: slimPersonCombinedCreditsCast(parsed.cast),
    };
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

function creditTitleEntry(c: PersonCombinedCastEntry) {
  if (c.title?.trim()) return c.title;
  if (c.name?.trim()) return c.name;
  return 'Untitled';
}

function creditYearEntry(c: PersonCombinedCastEntry) {
  const rel = c.release_date;
  const first = c.first_air_date;
  const raw =
    typeof rel === 'string' && rel ? rel : typeof first === 'string' && first ? first : '';
  if (!raw) return '';
  return raw.split('-')[0] ?? '';
}

export function enrichPersonCombinedCastForDisplay(
  cast: PersonCombinedCastEntry[] | undefined,
  imageBaseUrl: string,
  options?: { limit?: number },
): PersonCreditCardItem[] {
  if (!cast?.length) return [];
  const limit = options?.limit ?? CREDIT_DISPLAY_LIMIT;
  const seen = new Set<string>();
  const rows: PersonCreditCardItem[] = [];

  for (const c of cast) {
    if (rows.length >= limit) break;
    const key = `${String(c.media_type)}-${c.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      id: c.id,
      type: c.media_type,
      title: creditTitleEntry(c),
      year: creditYearEntry(c),
      posterUrl: formatImageUrlWithBase(
        typeof c.poster_path === 'string' ? c.poster_path : null,
        imageBaseUrl,
        'w500',
      ),
      character: typeof c.character === 'string' ? c.character : '',
      vote_average: typeof c.vote_average === 'number' ? c.vote_average : 0,
      vote_count: typeof c.vote_count === 'number' ? c.vote_count : 0,
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
