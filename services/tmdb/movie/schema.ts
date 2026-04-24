import { z } from 'zod';

import { GenreSchema } from '../genre/schema';

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
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
  media_type: z.string().optional(),
});

/** Raw TMDB list row; `get*Movies` APIs return this plus `posterUrl` / `backdropUrl` / `releaseYear` (see `MovieListItem`). */
export type MovieListItemRow = z.infer<typeof MovieListItemRowSchema>;

export type MovieListItem = MovieListItemRow & {
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
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  origin_country: z.array(z.string()).optional(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(ProductionCompanySchema),
  production_countries: z.array(ProductionCountrySchema),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number().nullable().optional(),
  spoken_languages: z.array(SpokenLanguageSchema),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export type MovieDetailsRow = z.infer<typeof MovieDetailsRowSchema>;

export type MovieDetails = MovieDetailsRow & {
  posterUrl: string;
  backdropUrl: string | null;
  releaseYear: string;
};

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
  adult: z.boolean().optional(),
  gender: z.number().optional(),
  id: z.number(),
  known_for_department: z.string().optional(),
  name: z.string(),
  original_name: z.string().optional(),
  popularity: z.number().optional(),
  profile_path: z.string().nullable().optional(),
});

export const CastMemberSchema = PersonCreditBlockSchema.extend({
  cast_id: z.number().optional(),
  character: z.string().optional(),
  credit_id: z.string().optional(),
  order: z.number().optional(),
});
export const CrewMemberSchema = PersonCreditBlockSchema.extend({
  credit_id: z.string().optional(),
  department: z.string().optional(),
  job: z.string().optional(),
});

export const MovieCreditsSchema = z.object({
  id: z.number(),
  cast: z.array(CastMemberSchema),
  crew: z.array(CrewMemberSchema),
});
export type MovieCredits = z.infer<typeof MovieCreditsSchema>;

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
