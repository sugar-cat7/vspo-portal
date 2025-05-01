CREATE TABLE "clip_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"view_count" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clip_stats_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
ALTER TABLE "clip_stats" ADD CONSTRAINT "clip_stats_video_id_video_raw_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("raw_id") ON DELETE cascade ON UPDATE no action;