import { z } from 'zod';

import { GenreSchema } from '../genre/schema';
import {
  CastMemberSchema,
  CrewMemberSchema,
  MovieAccountStatesSchema,
  MovieAlternativeTitlesResponseSchema,
  MovieIdChangesResponseSchema,
  MovieImagesResponseSchema,
  MovieKeywordsResponseSchema,
  MoviePublicListsResponseSchema,
  MovieReviewItemSchema,
  MovieReviewsResponseSchema,
  MovieTranslationsResponseSchema,
  MovieVideosResponseSchema,
  MovieWatchProvidersResponseSchema,
  VideoItemSchema,
} from '../movie/schema';

export const TvListItemRowSchema = z.looseObject({
  backdrop_path: z.string().nullable(),
  first_air_date: z.string(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  name: z.string(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  media_type: z.string().optional(),
  adult: z.boolean().optional(),
});

export type TvListItemRow = z.infer<typeof TvListItemRowSchema>;
export type TvListItem = TvListItemRow & {
  posterUrl: string;
  backdropUrl: string | null;
  firstAirYear: string;
};
export const TvListItemSchema = TvListItemRowSchema;

const paginated = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });

const TvPaginatedListSchema = paginated(TvListItemRowSchema);
export type TvPaginatedList = z.infer<typeof TvPaginatedListSchema>;

export const TvAiringTodayResponseSchema = TvPaginatedListSchema;
export const TvOnTheAirResponseSchema = TvPaginatedListSchema;
export const TvPopularResponseSchema = TvPaginatedListSchema;
export const TvTopRatedResponseSchema = TvPaginatedListSchema;

export const TvListChangesResultItemSchema = z.looseObject({
  id: z.number(),
  adult: z.boolean().optional(),
});
export const TvListChangesResponseSchema = z.object({
  page: z.number(),
  results: z.array(TvListChangesResultItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});
export type TvListChangesResponse = z.infer<typeof TvListChangesResponseSchema>;

const ProductionCompanySchema = z.looseObject({
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

export const TvDetailsRowSchema = z.looseObject({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  created_by: z.array(z.unknown()).optional(),
  episode_run_time: z.array(z.number()).optional(),
  first_air_date: z.string(),
  genres: z.array(GenreSchema),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  last_air_date: z.string().nullable().optional(),
  last_episode_to_air: z.unknown().nullable().optional(),
  name: z.string(),
  next_episode_to_air: z.unknown().nullable().optional(),
  networks: z.array(z.unknown()).optional(),
  number_of_episodes: z.number().optional(),
  number_of_seasons: z.number().optional(),
  origin_country: z.array(z.string()).optional(),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z.array(ProductionCompanySchema).optional(),
  production_countries: z.array(ProductionCountrySchema).optional(),
  seasons: z.array(z.unknown()).optional(),
  spoken_languages: z.array(SpokenLanguageSchema).optional(),
  status: z.string().optional(),
  tagline: z.string().optional(),
  type: z.string().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export type TvDetailsRow = z.infer<typeof TvDetailsRowSchema>;
export type TvDetails = TvDetailsRow & {
  posterUrl: string;
  backdropUrl: string | null;
  firstAirYear: string;
};
export const TvDetailsSchema = TvDetailsRowSchema;

export const TvCreditsSchema = z.object({
  id: z.number(),
  cast: z.array(CastMemberSchema),
  crew: z.array(CrewMemberSchema),
});
export type TvCredits = z.infer<typeof TvCreditsSchema>;

export const TvAggregateCreditsResponseSchema = z.looseObject({
  id: z.number().optional(),
  cast: z.array(z.unknown()),
  crew: z.array(z.unknown()),
});

export const TvExternalIdsSchema = z.looseObject({
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  freebase_mid: z.string().nullable().optional(),
  freebase_id: z.string().nullable().optional(),
  tvdb_id: z.number().nullable().optional(),
  tvrage_id: z.number().nullable().optional(),
  wikidata_id: z.string().nullable().optional(),
  facebook_id: z.string().nullable().optional(),
  instagram_id: z.string().nullable().optional(),
  twitter_id: z.string().nullable().optional(),
});
export type TvExternalIds = z.infer<typeof TvExternalIdsSchema>;

export const TvEpisodeRowSchema = z.looseObject({
  air_date: z.string().nullable().optional(),
  crew: z.array(z.unknown()).optional(),
  episode_number: z.number(),
  guest_stars: z.array(z.unknown()).optional(),
  name: z.string(),
  overview: z.string(),
  id: z.number(),
  production_code: z.string().nullable().optional(),
  runtime: z.number().nullable().optional(),
  season_number: z.number(),
  still_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
});
export type TvEpisodeRow = z.infer<typeof TvEpisodeRowSchema>;
export type TvEpisode = TvEpisodeRow & {
  stillUrl: string | null;
};

export const TvSeasonRowSchema = z.looseObject({
  _id: z.string().optional(),
  air_date: z.string().nullable().optional(),
  episodes: z.array(TvEpisodeRowSchema).optional(),
  name: z.string(),
  overview: z.string(),
  id: z.number(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number(),
  vote_average: z.number().optional(),
  networks: z.array(z.unknown()).optional(),
});
export type TvSeasonRow = z.infer<typeof TvSeasonRowSchema>;
export type TvSeason = TvSeasonRow & { posterUrl: string | null };

export const TvContentRatingsResponseSchema = z.object({
  id: z.number(),
  results: z.array(
    z.looseObject({
      iso_3166_1: z.string(),
      rating: z.string().optional().nullable(),
      descriptors: z.array(z.unknown()).optional(),
    }),
  ),
});
export type TvContentRatingsResponse = z.infer<typeof TvContentRatingsResponseSchema>;

export const TvScreenedTheatricallyResponseSchema = z.object({
  id: z.number(),
  results: z.array(
    z.looseObject({
      id: z.number(),
      episode_number: z.number(),
      season_number: z.number(),
    }),
  ),
});
export type TvScreenedTheatricallyResponse = z.infer<typeof TvScreenedTheatricallyResponseSchema>;

export const TvEpisodeGroupsResponseSchema = z.object({
  results: z.array(
    z.looseObject({
      description: z.string().optional().nullable(),
      episode_count: z.number().optional(),
      group_count: z.number().optional(),
      id: z.string().optional(),
      name: z.string().optional(),
      network: z.unknown().optional(),
      type: z.string().optional(),
    }),
  ),
});
export type TvEpisodeGroupsResponse = z.infer<typeof TvEpisodeGroupsResponseSchema>;

export const TvEpisodeGroupDetailsSchema = z.looseObject({
  description: z.string().optional().nullable(),
  episode_count: z.number().optional(),
  group_count: z.number().optional(),
  groups: z.array(z.unknown()).optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  network: z.unknown().optional(),
  type: z.string().optional(),
});

export const TvSeasonChangesResponseSchema = MovieIdChangesResponseSchema;
export const TvEpisodeChangesResponseSchema = MovieIdChangesResponseSchema;

export const TvIdChangesResponseSchema = MovieIdChangesResponseSchema;
export type TvIdChangesResponse = z.infer<typeof TvIdChangesResponseSchema>;

export const TvAccountStatesSchema = MovieAccountStatesSchema;
export type TvAccountStates = z.infer<typeof TvAccountStatesSchema>;

export const TvAlternativeTitlesResponseSchema = MovieAlternativeTitlesResponseSchema;
export type TvAlternativeTitlesResponse = z.infer<typeof TvAlternativeTitlesResponseSchema>;

export const TvImagesResponseSchema = MovieImagesResponseSchema;
export type TvImagesResponse = z.infer<typeof TvImagesResponseSchema>;

export const TvKeywordsResponseSchema = MovieKeywordsResponseSchema;
export type TvKeywordsResponse = z.infer<typeof TvKeywordsResponseSchema>;

export const TvPublicListsResponseSchema = MoviePublicListsResponseSchema;
export type TvPublicListsResponse = z.infer<typeof TvPublicListsResponseSchema>;

export const TvReviewsResponseSchema = MovieReviewsResponseSchema;
export type TvReviewsResponse = z.infer<typeof TvReviewsResponseSchema>;

export const TvReviewItemSchema = MovieReviewItemSchema;

export const TvVideosResponseSchema = MovieVideosResponseSchema;
export type TvVideosResponse = z.infer<typeof TvVideosResponseSchema>;

export { VideoItemSchema as TvVideoItemSchema };

export const TvWatchProvidersResponseSchema = MovieWatchProvidersResponseSchema;
export type TvWatchProvidersResponse = z.infer<typeof TvWatchProvidersResponseSchema>;

export const TvTranslationsResponseSchema = MovieTranslationsResponseSchema;
export type TvTranslationsResponse = z.infer<typeof TvTranslationsResponseSchema>;

export const TvSimilarResponseSchema = TvPaginatedListSchema;
export const TvRecommendationsResponseSchema = TvPaginatedListSchema;
export const TrendingTvResponseSchema = TvPaginatedListSchema;
