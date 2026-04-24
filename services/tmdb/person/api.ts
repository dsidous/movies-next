import { z } from 'zod';

import { getConfiguration } from '../configuration/api';
import { tmdbFetch } from '../client';
import {
  type DetailIncludeQuery,
  formatImageUrlWithBase,
  tmdbPath,
  tmdbPathWithInclude,
} from '../utils';
import { personEndpoints } from './endpoints';
import type {
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

export async function getPopularPeople(params?: Paged) {
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
}

/**
 * Person details. `include` maps to TMDB `append_to_response` (e.g. `images`, `movie_credits`, `tv_credits`, `combined_credits`, `tagged_images`).
 * @see https://developer.themoviedb.org/docs/append-to-response
 */
export async function getPerson(
  personId: number,
  params?: DetailIncludeQuery,
) {
  const [data, { images }] = await Promise.all([
    tmdbFetch<z.input<typeof PersonDetailsRowSchema>>(
      tmdbPathWithInclude(personEndpoints.details(personId), params),
    ),
    getConfiguration(),
  ]);
  return enrichPersonDetails(PersonDetailsRowSchema.parse(data), images.imageBaseUrl);
}

export async function getPersonIdChanges(personId: number, params?: IdChangesPathQuery) {
  const data = await tmdbFetch<z.input<typeof PersonIdChangesResponseSchema>>(
    tmdbPath(personEndpoints.itemChanges(personId), params as QueryRecord),
  );
  return PersonIdChangesResponseSchema.parse(data);
}

export async function getPersonCombinedCredits(personId: number) {
  const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
    personEndpoints.combinedCredits(personId),
  );
  return PersonCreditsResponseSchema.parse(data);
}

export async function getPersonExternalIds(personId: number) {
  const data = await tmdbFetch<z.input<typeof PersonExternalIdsSchema>>(
    personEndpoints.externalIds(personId),
  );
  return PersonExternalIdsSchema.parse(data);
}

export async function getPersonImages(
  personId: number,
  params?: { include_image_language?: string },
) {
  const data = await tmdbFetch<z.input<typeof PersonImagesResponseSchema>>(
    tmdbPath(personEndpoints.images(personId), params as QueryRecord),
  );
  return PersonImagesResponseSchema.parse(data);
}

export async function getPersonMovieCredits(personId: number) {
  const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
    personEndpoints.movieCredits(personId),
  );
  return PersonCreditsResponseSchema.parse(data);
}

export async function getPersonTaggedImages(
  personId: number,
  params?: Paged,
) {
  const data = await tmdbFetch<z.input<typeof PersonTaggedImagesResponseSchema>>(
    tmdbPath(personEndpoints.taggedImages(personId), params as QueryRecord),
  );
  return PersonTaggedImagesResponseSchema.parse(data);
}

export async function getPersonTranslations(personId: number) {
  const data = await tmdbFetch<z.input<typeof PersonTranslationsResponseSchema>>(
    personEndpoints.translations(personId),
  );
  return PersonTranslationsResponseSchema.parse(data);
}

export async function getPersonTvCredits(personId: number) {
  const data = await tmdbFetch<z.input<typeof PersonCreditsResponseSchema>>(
    personEndpoints.tvCredits(personId),
  );
  return PersonCreditsResponseSchema.parse(data);
}
