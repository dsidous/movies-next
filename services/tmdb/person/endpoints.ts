export const personEndpoints = {
  changes: 'person/changes',
  latest: 'person/latest',
  popular: 'person/popular',
  details: (personId: number) => `person/${personId}`,
  itemChanges: (personId: number) => `person/${personId}/changes`,
  combinedCredits: (personId: number) => `person/${personId}/combined_credits`,
  externalIds: (personId: number) => `person/${personId}/external_ids`,
  images: (personId: number) => `person/${personId}/images`,
  movieCredits: (personId: number) => `person/${personId}/movie_credits`,
  taggedImages: (personId: number) => `person/${personId}/tagged_images`,
  translations: (personId: number) => `person/${personId}/translations`,
  tvCredits: (personId: number) => `person/${personId}/tv_credits`,
} as const;
