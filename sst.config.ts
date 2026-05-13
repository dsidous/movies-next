export default $config({
  app(input) {
    return {
      name: 'movies-next',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { cloudflare: '0.1.0' }, // Add the provider here
    };
  },
  async run() {
    new sst.aws.Nextjs('MyMovieApp', {
      domain: {
        name: 'watch.tamasjonas.com',
        dns: sst.cloudflare.dns(), // This tells SST to use Cloudflare for DNS
      },
      environment: {
        NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY!,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
      },
    });
  },
});
