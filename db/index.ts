import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

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

let cachedConnectionString: string | undefined;
let dbPromise: ReturnType<typeof createDb> | undefined;

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

export async function getDb() {
  const connectionString = await resolveConnectionString();
  if (!dbPromise || cachedConnectionString !== connectionString) {
    cachedConnectionString = connectionString;
    dbPromise = createDb(connectionString);
  }
  return dbPromise;
}
