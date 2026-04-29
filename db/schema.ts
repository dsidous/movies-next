import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  createdAt: timestamp('created_at').defaultNow(),
  externalId: text('external_id').notNull().unique(),
  id: uuid('id').primaryKey().defaultRandom().notNull(),
});

export const watchlistMediaType = pgEnum('watchlist_media_type', ['movie', 'tv']);

export const watchlist = pgTable(
  'watchlist',
  {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    mediaType: watchlistMediaType('media_type').notNull(),
    mediaId: text('media_id').notNull(),
    title: text('title'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('watchlist_user_id_index').on(table.userId),
    uniqueIndex('watchlist_user_media_unique').on(table.userId, table.mediaType, table.mediaId),
  ],
);

export const userRelations = relations(users, ({ many }) => ({
  watchlist: many(watchlist),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
}));
