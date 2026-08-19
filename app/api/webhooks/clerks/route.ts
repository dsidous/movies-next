import { headers } from 'next/headers';

import { WebhookEvent } from '@clerk/nextjs/server';
import { upsertUser } from '@services/users';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // 1. Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // 2. Get the raw body as a string for verification
  //    (Svix signs the exact raw bytes; re-serializing via JSON.parse/stringify
  //    can alter them — e.g. drop a trailing newline — and break verification.)
  const body = await req.text();

  // 3. Verify the payload
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    await upsertUser(id!);
  }

  return new Response('User synced', { status: 200 });
}
