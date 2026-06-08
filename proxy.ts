import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Search/SEO crawlers and common scrapers. Matched requests get 403 before SSR.
 * `/robots.txt` is allowed through so crawlers can read Disallow: /.
 */
const CRAWLER_UA =
  /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandexbot|applebot|petalbot|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|pinterestbot|embedly|quora link preview|redditbot|whatsapp|telegrambot|discordbot|semrushbot|ahrefsbot|mj12bot|dotbot|rogerbot|screaming frog|uptimerobot|pingdom|statuscake|archive\.org_bot|ia_archiver/i;

/**
 * Excluded on purpose:
 * - `/_next/*` — static chunks, RSC data, HMR; avoids an Edge hit per prefetch chunk.
 * - `/api/webhooks/*` — Svix-signed Clerk webhooks; no browser session; skips Clerk session work.
 *
 * Default `clerkMiddleware()` does not call `auth.protect()`; pages use `auth()` where needed.
 * Use `prefetch={false}` on Links to heavy routes so navigations do not spike prefetch + origin transfer.
 */
export default clerkMiddleware((_auth, req) => {
  const ua = req.headers.get('user-agent') ?? '';
  if (CRAWLER_UA.test(ua) && req.nextUrl.pathname !== '/robots.txt') {
    return new NextResponse(null, {
      status: 403,
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
});

export const config = {
  matcher: [
    '/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
