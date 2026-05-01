import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Edge / Fluid CPU on Vercel: middleware runs only for paths matched below.
 *
 * Excluded on purpose:
 * - `/_next/*` — static chunks, RSC data, HMR; avoids an Edge hit per prefetch chunk.
 * - `/api/webhooks/*` — Svix-signed Clerk webhooks; no browser session; skips Clerk session work.
 *
 * Default `clerkMiddleware()` does not call `auth.protect()`; pages use `auth()` where needed.
 * Use `prefetch={false}` on Links to heavy routes so navigations do not spike prefetch + origin transfer.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
