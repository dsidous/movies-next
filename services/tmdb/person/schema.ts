import { z } from 'zod';

import { MovieIdChangesResponseSchema } from '../movie/schema';

const ProfileImageFileSchema = z.looseObject({
  aspect_ratio: z.number(),
  height: z.number(),
  iso_639_1: z.union([z.string(), z.null()]).optional(),
  file_path: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  width: z.number(),
});

export const PersonPopularListItemRowSchema = z.looseObject({
  adult: z.boolean().optional(),
  gender: z.number().optional(),
  id: z.number(),
  known_for: z.array(z.unknown()).optional(),
  known_for_department: z.string().optional().nullable(),
  name: z.string(),
  popularity: z.number().optional(),
  profile_path: z.string().nullable().optional(),
});
export type PersonPopularListItemRow = z.infer<typeof PersonPopularListItemRowSchema>;

/** Popular list card — hot path returns only these fields. */
export type PersonPopularListItem = {
  id: number;
  name: string;
  profileUrl: string;
  known_for_department: string | null | undefined;
};

const paginated = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });

export const PersonPopularResponseSchema = paginated(PersonPopularListItemRowSchema);
export type PersonPopularResponse = z.infer<typeof PersonPopularResponseSchema>;

export const PersonListChangesResultItemSchema = z.looseObject({
  id: z.number(),
  adult: z.boolean().optional(),
});
export const PersonListChangesResponseSchema = z.object({
  page: z.number(),
  results: z.array(PersonListChangesResultItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type PersonListChangesResponse = z.infer<typeof PersonListChangesResponseSchema>;

export const PersonDetailsRowSchema = z.looseObject({
  adult: z.boolean().optional(),
  also_known_as: z.array(z.string()).optional(),
  biography: z.string().optional().nullable(),
  birthday: z.string().nullable().optional(),
  deathday: z.string().nullable().optional(),
  gender: z.number().optional(),
  homepage: z.string().nullable().optional(),
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  known_for_department: z.string().nullable().optional(),
  name: z.string(),
  place_of_birth: z.string().nullable().optional(),
  popularity: z.number().optional(),
  profile_path: z.string().nullable().optional(),
});
export type PersonDetailsRow = z.infer<typeof PersonDetailsRowSchema>;

/** Person profile for app UI — hot paths return only this shape. */
export type PersonDetails = {
  id: number;
  name: string;
  known_for_department: string | null | undefined;
  biography: string | null | undefined;
  birthday: string | null | undefined;
  deathday: string | null | undefined;
  place_of_birth: string | null | undefined;
  profileUrl: string;
};

export const PersonDetailsSchema = PersonDetailsRowSchema;

export type PersonCreditCardItem = {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  year: string;
  posterUrl: string;
  character: string;
  vote_average: number;
  vote_count: number;
};

/** One combined-credits cast row — {@link enrichPersonCombinedCastForDisplay}. */
export type PersonCombinedCastEntry = {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  character?: string;
  vote_average?: number;
  vote_count?: number;
};

export type PersonCombinedCredits = {
  id?: number;
  cast: PersonCombinedCastEntry[];
};

export const PersonIdChangesResponseSchema = MovieIdChangesResponseSchema;
export type PersonIdChangesResponse = z.infer<typeof PersonIdChangesResponseSchema>;

export const PersonCreditsResponseSchema = z.looseObject({
  id: z.number().optional(),
  cast: z.array(z.unknown()),
  crew: z.array(z.unknown()),
});

export const PersonExternalIdsSchema = z.looseObject({
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  wikidata_id: z.string().nullable().optional(),
  facebook_id: z.string().nullable().optional(),
  freebase_id: z.string().nullable().optional(),
  freebase_mid: z.string().nullable().optional(),
  instagram_id: z.string().nullable().optional(),
  tvrage_id: z.number().nullable().optional(),
  twitter_id: z.string().nullable().optional(),
});
export type PersonExternalIds = z.infer<typeof PersonExternalIdsSchema>;

export const PersonImagesResponseSchema = z.object({
  id: z.number(),
  profiles: z.array(ProfileImageFileSchema),
});
export type PersonImagesResponse = z.infer<typeof PersonImagesResponseSchema>;

export const PersonTaggedImageResultSchema = z.looseObject({
  aspect_ratio: z.number().optional(),
  file_path: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  iso_639_1: z.union([z.string(), z.null()]).optional(),
  media: z.unknown().optional(),
  media_type: z.string().optional(),
  type: z.string().optional(),
});

export const PersonTaggedImagesResponseSchema = z.object({
  id: z.number(),
  page: z.number(),
  results: z.array(PersonTaggedImageResultSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type PersonTaggedImagesResponse = z.infer<typeof PersonTaggedImagesResponseSchema>;

export const PersonTranslationsResponseSchema = z.object({
  id: z.number(),
  translations: z.array(
    z.object({
      iso_3166_1: z.string().optional().nullable(),
      iso_639_1: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      english_name: z.string().optional().nullable(),
      data: z.looseObject({
        biography: z.string().optional().nullable(),
        name: z.string().optional().nullable(),
      }),
    }),
  ),
});
export type PersonTranslationsResponse = z.infer<typeof PersonTranslationsResponseSchema>;
