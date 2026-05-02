import { z } from 'zod';

function ensureTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

const ConfigurationImagesSchema = z
  .object({
    base_url: z.string(),
    secure_base_url: z.string(),
    backdrop_sizes: z.array(z.string()),
    logo_sizes: z.array(z.string()),
    poster_sizes: z.array(z.string()),
    profile_sizes: z.array(z.string()),
    still_sizes: z.array(z.string()),
  })
  .transform((data) => ({
    ...data,
    /** Use HTTPS base with a trailing slash for safe path joining. */
    imageBaseUrl: ensureTrailingSlash(data.secure_base_url),
  }));

export const ConfigurationSchema = z.object({
  images: ConfigurationImagesSchema,
  change_keys: z.array(z.string()),
});

export type Configuration = z.infer<typeof ConfigurationSchema>;

/** What {@link getConfiguration} returns to the app (images only). */
export type TmdbAppConfiguration = {
  images: {
    imageBaseUrl: string;
  };
};

export const CountrySchema = z.object({
  iso_3166_1: z.string(),
  english_name: z.string(),
  native_name: z.string(),
});

export type Country = z.infer<typeof CountrySchema>;

export const DepartmentJobsSchema = z.object({
  department: z.string(),
  jobs: z.array(z.string()),
});

export type DepartmentJobs = z.infer<typeof DepartmentJobsSchema>;

export const LanguageSchema = z.object({
  iso_639_1: z.string(),
  english_name: z.string(),
  name: z.string(),
});

export type Language = z.infer<typeof LanguageSchema>;

export const PrimaryTranslationsSchema = z.array(z.string());

export type PrimaryTranslations = z.infer<typeof PrimaryTranslationsSchema>;

export const TimezoneGroupSchema = z.object({
  iso_3166_1: z.string(),
  zones: z.array(z.string()),
});

export type TimezoneGroup = z.infer<typeof TimezoneGroupSchema>;
