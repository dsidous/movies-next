// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- SST forbids imports here; globals come from generated types
/// <reference path="./.sst/platform/config.d.ts" />

function envOrDefault(name: string, defaultValue: string): string {
  const v = process.env[name];
  return v != null && v !== '' ? v : defaultValue;
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (v == null || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

const retainStages = new Set(
  envOrDefault('SST_RETAIN_STAGES', 'production,prod')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

export default $config({
  app(input) {
    const stage = input?.stage ?? '';
    return {
      name: envOrDefault('SST_APP_NAME', 'movies-next'),
      removal: retainStages.has(stage) ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        cloudflare: envOrDefault('SST_CLOUDFLARE_PROVIDER_VERSION', '6.15.0'),
      },
    };
  },
  async run() {
    const domainName = requiredEnv('SST_SITE_DOMAIN');
    const nextjsName = envOrDefault('SST_NEXTJS_NAME', 'MyMovieApp');

    new sst.aws.Nextjs(nextjsName, {
      domain: {
        name: domainName,
        dns: sst.cloudflare.dns(),
      },
      environment: {
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET!,
        DATABASE_URL: process.env.DATABASE_URL!,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        TMDB_API_TOKEN: process.env.TMDB_API_TOKEN!,
        TMDB_BASE_URL: process.env.TMDB_BASE_URL!,
      },
    });
  },
});
