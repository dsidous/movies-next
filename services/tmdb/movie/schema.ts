import { z } from 'zod';

import { type Genre, GenreSchema } from '../genre/schema';

export const MovieListItemRowSchema = z.looseObject({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  release_date: z.string().nullable(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
  media_type: z.string().optional(),
});

/** Raw TMDB list row from discover / lists API (parsed only; see {@link MovieListItem}). */
export type MovieListItemRow = z.infer<typeof MovieListItemRowSchema>;

/** List card / feed / hero item — fields returned from hot-path movie list transforms only. */
export type MovieListItem = {
  id: number;
  title: string;
  overview: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  posterUrl: string;
  backdropUrl: string | null;
  releaseYear: string;
};

/** Alias for `MovieListItemRowSchema`. */
export const MovieListItemSchema = MovieListItemRowSchema;

export const MovieDateRangeSchema = z.object({
  maximum: z.string(),
  minimum: z.string(),
});

const paginated = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });

const MoviePaginatedListSchema = paginated(MovieListItemRowSchema);
export type MoviePaginatedList = z.infer<typeof MoviePaginatedListSchema>;

export const NowPlayingResponseSchema = z.object({
  dates: MovieDateRangeSchema,
  page: z.number(),
  results: z.array(MovieListItemRowSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type NowPlayingResponse = z.infer<typeof NowPlayingResponseSchema>;

export const UpcomingResponseSchema = z.object({
  dates: MovieDateRangeSchema,
  page: z.number(),
  results: z.array(MovieListItemRowSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type UpcomingResponse = z.infer<typeof UpcomingResponseSchema>;

export const PopularResponseSchema = MoviePaginatedListSchema;
export const TopRatedResponseSchema = MoviePaginatedListSchema;

export const MovieListChangesResultItemSchema = z.looseObject({
  id: z.number(),
  adult: z.boolean().optional(),
});

export const MovieListChangesResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieListChangesResultItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type MovieListChangesResponse = z.infer<typeof MovieListChangesResponseSchema>;

const BelongsToCollectionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
  })
  .nullable();

const ProductionCompanySchema = z.object({
  id: z.number(),
  logo_path: z.string().nullable().optional(),
  name: z.string(),
  origin_country: z.string().optional(),
});

const ProductionCountrySchema = z.object({
  iso_3166_1: z.string(),
  name: z.string(),
});

const SpokenLanguageSchema = z.object({
  english_name: z.string(),
  iso_639_1: z.string(),
  name: z.string(),
});

export const MovieDetailsRowSchema = z.looseObject({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: BelongsToCollectionSchema.optional().nullable(),
  budget: z.number(),
  genres: z.array(GenreSchema),
  homepage: z.string().nullable(),
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  origin_country: z.array(z.string()).optional(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string().nullable(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(ProductionCompanySchema),
  production_countries: z.array(ProductionCountrySchema),
  release_date: z.string().nullable(),
  revenue: z.number(),
  runtime: z.number().nullable().optional(),
  spoken_languages: z.array(SpokenLanguageSchema),
  status: z.string(),
  tagline: z.string().nullable(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export type MovieDetailsRow = z.infer<typeof MovieDetailsRowSchema>;

/** Movie detail for app UI — hot paths return only this shape (not full TMDB row). */
export type MovieDetails = {
  id: number;
  title: string;
  overview: string | null;
  release_date: string | null;
  runtime: number | null | undefined;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  tagline: string | null;
  posterUrl: string;
  backdropUrl: string | null;
  releaseYear: string;
};

/** YouTube/other video row on detail pages (append). */
export type MovieVideoResultForUi = {
  site: string | null;
  key: string | null;
  name: string | null;
  type: string | null;
};

/** Cast member on appended `credits` (feed into {@link enrichCastForDisplay}). */
export type CreditsCastForDisplay = {
  id: number;
  credit_id?: string;
  name?: string;
  character?: string;
  profile_path?: string | null;
};

function readFiniteTmdbPersonId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function readOptionalCreditsString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  return undefined;
}

function readCreditId(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

/**
 * `append_to_response=credits` on movie/TV detail. Only reads `cast`; ignores `crew`.
 * Rows that fail sanity checks are skipped so one bad TMDB row cannot drop all credits.
 */
export function mapTmdbAppendedCreditsCast(rawCredits: unknown): CreditsCastForDisplay[] {
  if (rawCredits == null || typeof rawCredits !== 'object') return [];
  const castUnknown = (rawCredits as Record<string, unknown>).cast;
  if (!Array.isArray(castUnknown)) return [];
  const out: CreditsCastForDisplay[] = [];
  for (const item of castUnknown) {
    if (item == null || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = readFiniteTmdbPersonId(row.id);
    if (id == null) continue;
    const pp = row.profile_path;
    out.push({
      id,
      credit_id: readCreditId(row.credit_id),
      name: readOptionalCreditsString(row.name),
      character: readOptionalCreditsString(row.character),
      profile_path:
        pp === undefined
          ? undefined
          : pp === null || typeof pp === 'string'
            ? pp
            : undefined,
    });
  }
  return out;
}

/** Alias for `MovieDetailsRowSchema`. */
export const MovieDetailsSchema = MovieDetailsRowSchema;

export const MovieAccountStatesSchema = z.object({
  id: z.number(),
  favorite: z.boolean().optional(),
  rated: z.union([z.boolean(), z.object({ value: z.number() })]).optional(),
  watchlist: z.boolean().optional(),
});
export type MovieAccountStates = z.infer<typeof MovieAccountStatesSchema>;

export const MovieAlternativeTitlesResponseSchema = z.object({
  id: z.number(),
  titles: z.array(
    z.object({
      iso_3166_1: z.string(),
      title: z.string(),
      type: z.string().optional().nullable(),
    }),
  ),
});
export type MovieAlternativeTitlesResponse = z.infer<typeof MovieAlternativeTitlesResponseSchema>;

export const MovieIdChangesResponseSchema = z.object({
  changes: z.array(
    z.looseObject({
      key: z.string(),
      items: z.array(
        z.looseObject({
          id: z.string().optional(),
          action: z.string().optional(),
          time: z.string().optional(),
          value: z.unknown().optional(),
        }),
      ),
    }),
  ),
});
export type MovieIdChangesResponse = z.infer<typeof MovieIdChangesResponseSchema>;

const PersonCreditBlockSchema = z.looseObject({
  // TMDB often sends explicit null where these are unknown.
  adult: z.boolean().nullish(),
  gender: z.number().nullish(),
  id: z.number(),
  known_for_department: z.string().nullish(),
  name: z.string().nullish(),
  original_name: z.string().nullish(),
  popularity: z.number().nullish(),
  profile_path: z.string().nullable().nullish(),
});

export const CastMemberSchema = PersonCreditBlockSchema.extend({
  cast_id: z.number().nullish(),
  character: z.string().nullish(),
  credit_id: z.string().nullish(),
  order: z.number().nullish(),
});
export const CrewMemberSchema = PersonCreditBlockSchema.extend({
  credit_id: z.string().nullish(),
  department: z.string().nullish(),
  job: z.string().nullish(),
});

export const MovieCreditsSchema = z.object({
  id: z.number(),
  cast: z.array(CastMemberSchema),
  crew: z.array(CrewMemberSchema),
});
export type MovieCredits = z.infer<typeof MovieCreditsSchema>;

export type CastDisplayItem = {
  id: number;
  creditId: string;
  name: string;
  character: string;
  profileUrl: string | null;
};

export const MovieExternalIdsSchema = z.looseObject({
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  wikidata_id: z.string().nullable().optional(),
  facebook_id: z.string().nullable().optional(),
  instagram_id: z.string().nullable().optional(),
  twitter_id: z.string().nullable().optional(),
});
export type MovieExternalIds = z.infer<typeof MovieExternalIdsSchema>;

const ImageFileSchema = z.looseObject({
  aspect_ratio: z.number(),
  height: z.number(),
  iso_639_1: z.union([z.string(), z.null()]).optional(),
  file_path: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  width: z.number(),
});

export const MovieImagesResponseSchema = z.object({
  id: z.number(),
  backdrops: z.array(ImageFileSchema),
  posters: z.array(ImageFileSchema),
  logos: z.array(ImageFileSchema),
});
export type MovieImagesResponse = z.infer<typeof MovieImagesResponseSchema>;

export const MovieKeywordsResponseSchema = z.object({
  id: z.number(),
  keywords: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
});
export type MovieKeywordsResponse = z.infer<typeof MovieKeywordsResponseSchema>;

export const PublicListItemSchema = z.object({
  description: z.string().optional().nullable(),
  favorite_count: z.number(),
  id: z.number(),
  item_count: z.number(),
  iso_639_1: z.string().optional().nullable(),
  list_type: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  poster_path: z.string().nullable().optional(),
});
export const MoviePublicListsResponseSchema = z.object({
  id: z.number(),
  page: z.number(),
  results: z.array(PublicListItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type MoviePublicListsResponse = z.infer<typeof MoviePublicListsResponseSchema>;

export const MovieReleaseDatesResponseSchema = z.object({
  id: z.number(),
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      release_dates: z.array(
        z.object({
          certification: z.string().optional().nullable(),
          iso_639_1: z.string().optional().nullable(),
          note: z.string().optional().nullable(),
          release_date: z.string(),
          type: z.number().optional().nullable(),
          descriptors: z.array(z.unknown()).optional(),
        }),
      ),
    }),
  ),
});
export type MovieReleaseDatesResponse = z.infer<typeof MovieReleaseDatesResponseSchema>;

const ReviewAuthorSchema = z.object({
  name: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  avatar_path: z.string().nullable().optional(),
  rating: z.number().nullish().optional(),
});

export const MovieReviewItemSchema = z.object({
  author: z.string().optional().nullable(),
  author_details: ReviewAuthorSchema.optional().nullable(),
  content: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  id: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
});
export const MovieReviewsResponseSchema = z.object({
  id: z.number().optional().nullable(),
  page: z.number(),
  results: z.array(MovieReviewItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type MovieReviewsResponse = z.infer<typeof MovieReviewsResponseSchema>;

export const VideoItemSchema = z.looseObject({
  id: z.string().optional().nullable(),
  iso_639_1: z.string().optional().nullable(),
  iso_3166_1: z.string().optional().nullable(),
  key: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  official: z.boolean().optional().nullable(),
  published_at: z.string().nullish().optional(),
  site: z.string().optional().nullable(),
  size: z.number().optional().nullable(),
  type: z.string().optional().nullable(),
});

export const MovieVideosResponseSchema = z.object({
  id: z.number().optional().nullable(),
  results: z.array(VideoItemSchema),
});
export type MovieVideosResponse = z.infer<typeof MovieVideosResponseSchema>;

export type SimilarMoviesEnriched = {
  page: number;
  results: MovieListItem[];
  total_pages: number;
  total_results: number;
};

export type MovieDetailsWithAppends = MovieDetails & {
  videos?: { results: MovieVideoResultForUi[] };
  credits?: { cast: CreditsCastForDisplay[] };
  similar?: SimilarMoviesEnriched;
};

const WatchProviderOptionSchema = z.looseObject({
  display_priority: z.number().optional().nullable(),
  logo_path: z.string().nullish().optional(),
  provider_id: z.number().optional().nullable(),
  provider_name: z.string().optional().nullable(),
});

const WatchProviderRegionDataSchema = z.looseObject({
  link: z.string().optional().nullable(),
  flatrate: z.array(WatchProviderOptionSchema).optional().nullable(),
  buy: z.array(WatchProviderOptionSchema).optional().nullable(),
  rent: z.array(WatchProviderOptionSchema).optional().nullable(),
  ads: z.array(WatchProviderOptionSchema).optional().nullable(),
});

export const MovieWatchProvidersResponseSchema = z.object({
  id: z.number(),
  results: z.record(z.string(), WatchProviderRegionDataSchema),
});
export type MovieWatchProvidersResponse = z.infer<typeof MovieWatchProvidersResponseSchema>;

const TranslationDataSchema = z.looseObject({
  title: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  homepage: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  runtime: z.number().optional().nullable(),
});

export const MovieTranslationsResponseSchema = z.object({
  id: z.number().optional().nullable(),
  translations: z.array(
    z.object({
      iso_3166_1: z.string().optional().nullable(),
      iso_639_1: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      english_name: z.string().optional().nullable(),
      data: TranslationDataSchema,
    }),
  ),
});
export type MovieTranslationsResponse = z.infer<typeof MovieTranslationsResponseSchema>;

export const SimilarMoviesResponseSchema = MoviePaginatedListSchema;
export const MovieRecommendationsResponseSchema = MoviePaginatedListSchema;
export const TrendingMoviesResponseSchema = MoviePaginatedListSchema;
