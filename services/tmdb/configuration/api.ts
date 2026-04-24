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
} from './schema';

export async function getConfiguration() {
  const data = await tmdbFetch<z.input<typeof ConfigurationSchema>>(
    configurationEndpoints.details,
  );
  return ConfigurationSchema.parse(data);
}

export async function getConfigurationCountries() {
  const data = await tmdbFetch<z.input<typeof CountrySchema>[]>(
    configurationEndpoints.countries,
  );
  return z.array(CountrySchema).parse(data);
}

export async function getConfigurationJobs() {
  const data = await tmdbFetch<z.input<typeof DepartmentJobsSchema>[]>(
    configurationEndpoints.jobs,
  );
  return z.array(DepartmentJobsSchema).parse(data);
}

export async function getConfigurationLanguages() {
  const data = await tmdbFetch<z.input<typeof LanguageSchema>[]>(
    configurationEndpoints.languages,
  );
  return z.array(LanguageSchema).parse(data);
}

export async function getConfigurationPrimaryTranslations() {
  const data = await tmdbFetch<z.input<typeof PrimaryTranslationsSchema>>(
    configurationEndpoints.primaryTranslations,
  );
  return PrimaryTranslationsSchema.parse(data);
}

export async function getConfigurationTimezones() {
  const data = await tmdbFetch<z.input<typeof TimezoneGroupSchema>[]>(
    configurationEndpoints.timezones,
  );
  return z.array(TimezoneGroupSchema).parse(data);
}
