import { unstable_cache } from 'next/cache';

import { z } from 'zod';

import { tmdbFetch } from '../client';
import { configurationEndpoints } from './endpoints';
import {
  ConfigurationSchema,
  CountrySchema,
  DepartmentJobsSchema,
  LanguageSchema,
  PrimaryTranslationsSchema,
  TimezoneGroupSchema,
  type TmdbAppConfiguration,
} from './schema';

// Configuration data is essentially static — cache for 24h
const TTL = 60 * 60 * 24;

// This is called by nearly every other api.ts, so caching it is high-impact.
export const getConfiguration = unstable_cache(
  async (): Promise<TmdbAppConfiguration> => {
    const data = await tmdbFetch<z.input<typeof ConfigurationSchema>>(
      configurationEndpoints.details,
    );
    const parsed = ConfigurationSchema.parse(data);
    return {
      images: {
        imageBaseUrl: parsed.images.imageBaseUrl,
      },
    };
  },
  ['tmdb-configuration'],
  { revalidate: TTL },
);

export const getConfigurationCountries = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof CountrySchema>[]>(configurationEndpoints.countries);
    return z.array(CountrySchema).parse(data);
  },
  ['tmdb-configuration-countries'],
  { revalidate: TTL },
);

export const getConfigurationJobs = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof DepartmentJobsSchema>[]>(
      configurationEndpoints.jobs,
    );
    return z.array(DepartmentJobsSchema).parse(data);
  },
  ['tmdb-configuration-jobs'],
  { revalidate: TTL },
);

export const getConfigurationLanguages = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof LanguageSchema>[]>(
      configurationEndpoints.languages,
    );
    return z.array(LanguageSchema).parse(data);
  },
  ['tmdb-configuration-languages'],
  { revalidate: TTL },
);

export const getConfigurationPrimaryTranslations = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof PrimaryTranslationsSchema>>(
      configurationEndpoints.primaryTranslations,
    );
    return PrimaryTranslationsSchema.parse(data);
  },
  ['tmdb-configuration-primary-translations'],
  { revalidate: TTL },
);

export const getConfigurationTimezones = unstable_cache(
  async () => {
    const data = await tmdbFetch<z.input<typeof TimezoneGroupSchema>[]>(
      configurationEndpoints.timezones,
    );
    return z.array(TimezoneGroupSchema).parse(data);
  },
  ['tmdb-configuration-timezones'],
  { revalidate: TTL },
);
