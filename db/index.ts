import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { cache } from 'react';

import * as schema from './schema';

declare global {
  interface CloudflareEnv {
    HYPERDRIVE?: { connectionString: string };
  }
}

async function resolveConnectionString(): Promise<string> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (env.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Not running inside the Workers runtime.
  }
  return process.env.DATABASE_URL!;
}

function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    max: 1,
    connect_timeout: 15,
    // Hyperdrive's pooled origin connections hang on prepared statements
    // (postgres.js defaults to prepare: true).
    prepare: false,
  });
  return drizzle(client, { schema, logger: true });
}

/**
 * Returns a Drizzle client. Wrapped in React `cache()` so the postgres client is
 * scoped to the current request. A module-level singleton must NOT be used on
 * Cloudflare Workers: an isolate serves many requests, and a connection opened
 * in one request's context cannot be reused by another ("Cannot perform I/O on
 * behalf of a different request").
 */
export const getDb = cache(async () => {
  const connectionString = await resolveConnectionString();
  return createDb(connectionString);
});
