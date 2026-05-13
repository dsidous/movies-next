// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- SST forbids imports here; globals come from generated types
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'movies-next',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        cloudflare: '6.15.0',
      },
    };
  },
  async run() {
    new sst.aws.Nextjs('MyMovieApp', {
      domain: {
        name: 'watch.tamasjonas.com',
        dns: sst.cloudflare.dns(), // This tells SST to use Cloudflare for DNS
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
