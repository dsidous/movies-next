export const tvEndpoints = {
  changes: 'tv/changes',
  latest: 'tv/latest',
  airingToday: 'tv/airing_today',
  onTheAir: 'tv/on_the_air',
  popular: 'tv/popular',
  topRated: 'tv/top_rated',
  details: (seriesId: number) => `tv/${seriesId}`,
  accountStates: (seriesId: number) => `tv/${seriesId}/account_states`,
  alternativeTitles: (seriesId: number) => `tv/${seriesId}/alternative_titles`,
  itemChanges: (seriesId: number) => `tv/${seriesId}/changes`,
  aggregateCredits: (seriesId: number) => `tv/${seriesId}/aggregate_credits`,
  credits: (seriesId: number) => `tv/${seriesId}/credits`,
  contentRatings: (seriesId: number) => `tv/${seriesId}/content_ratings`,
  episodeGroups: (seriesId: number) => `tv/${seriesId}/episode_groups`,
  externalIds: (seriesId: number) => `tv/${seriesId}/external_ids`,
  images: (seriesId: number) => `tv/${seriesId}/images`,
  keywords: (seriesId: number) => `tv/${seriesId}/keywords`,
  lists: (seriesId: number) => `tv/${seriesId}/lists`,
  recommendations: (seriesId: number) => `tv/${seriesId}/recommendations`,
  reviews: (seriesId: number) => `tv/${seriesId}/reviews`,
  screenedTheatrically: (seriesId: number) => `tv/${seriesId}/screened_theatrically`,
  similar: (seriesId: number) => `tv/${seriesId}/similar`,
  translations: (seriesId: number) => `tv/${seriesId}/translations`,
  videos: (seriesId: number) => `tv/${seriesId}/videos`,
  watchProviders: (seriesId: number) => `tv/${seriesId}/watch/providers`,
  season: (seriesId: number, seasonNumber: number) => `tv/${seriesId}/season/${seasonNumber}`,
  seasonAccountStates: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/account_states`,
  seasonAggregateCredits: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/aggregate_credits`,
  seasonCredits: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/credits`,
  seasonExternalIds: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/external_ids`,
  seasonImages: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/images`,
  seasonTranslations: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/translations`,
  seasonVideos: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/videos`,
  seasonWatchProviders: (seriesId: number, seasonNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/watch/providers`,
  episode: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
  episodeAccountStates: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/account_states`,
  episodeCredits: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/credits`,
  episodeExternalIds: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/external_ids`,
  episodeImages: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/images`,
  episodeTranslations: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/translations`,
  episodeVideos: (seriesId: number, seasonNumber: number, episodeNumber: number) =>
    `tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}/videos`,
  episodeGroup: (tvEpisodeGroupId: string) => `tv/episode_group/${tvEpisodeGroupId}`,
  seasonChanges: (seasonId: string) => `tv/season/${seasonId}/changes`,
  episodeChanges: (episodeId: string) => `tv/episode/${episodeId}/changes`,
  trending: (time: 'day' | 'week') => `trending/tv/${time}`,
} as const;
