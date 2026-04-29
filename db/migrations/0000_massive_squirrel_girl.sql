CREATE TYPE "public"."watchlist_media_type" AS ENUM('movie', 'tv');--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp DEFAULT now(),
	"external_id" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"media_type" "watchlist_media_type" NOT NULL,
	"media_id" text NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watchlist_user_id_index" ON "watchlist" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlist_user_media_unique" ON "watchlist" USING btree ("user_id","media_type","media_id");