CREATE TABLE IF NOT EXISTS "channel" (
	"id" text PRIMARY KEY NOT NULL,
	"platform_channel_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"platform_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"subscriber_count" integer NOT NULL,
	"thumbnail_url" text NOT NULL,
	CONSTRAINT "channel_platform_channel_id_unique" UNIQUE("platform_channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"member_type" text NOT NULL,
	"representative_thumbnail_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stream_status" (
	"id" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"view_count" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video" (
	"id" text PRIMARY KEY NOT NULL,
	"raw_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"platform_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"video_type" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"tags" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	CONSTRAINT "video_raw_id_unique" UNIQUE("raw_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "channel_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stream_status" ADD CONSTRAINT "stream_status_video_id_video_raw_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("raw_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "video" ADD CONSTRAINT "video_channel_id_channel_platform_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("platform_channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
