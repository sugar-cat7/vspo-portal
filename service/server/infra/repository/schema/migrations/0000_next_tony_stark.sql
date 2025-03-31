CREATE TABLE "channel" (
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
CREATE TABLE "creator" (
	"id" text PRIMARY KEY NOT NULL,
	"member_type" text NOT NULL,
	"representative_thumbnail_url" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"lang_code" text NOT NULL,
	"name" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_translation_creator_id_lang_code_unique" UNIQUE("creator_id","lang_code")
);
--> statement-breakpoint
CREATE TABLE "discord_admin_message" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_id" text NOT NULL,
	"discord_admin_message_id" text NOT NULL,
	"message_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_admin_message_discord_admin_message_id_message_id_unique" UNIQUE("discord_admin_message_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "discord_channel" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_channel_id" text NOT NULL,
	"server_id" text NOT NULL,
	"name" text NOT NULL,
	"lang_code" text NOT NULL,
	"member_type" text DEFAULT 'vspo_all' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_channel_discord_channel_id_unique" UNIQUE("discord_channel_id"),
	CONSTRAINT "discord_channel_discord_channel_id_server_id_unique" UNIQUE("discord_channel_id","server_id")
);
--> statement-breakpoint
CREATE TABLE "discord_message" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discord_server" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_server_id" text NOT NULL,
	"name" text NOT NULL,
	"lang_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_server_discord_server_id_unique" UNIQUE("discord_server_id")
);
--> statement-breakpoint
CREATE TABLE "stream_status" (
	"id" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"view_count" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stream_status_video_id_unique" UNIQUE("video_id")
);
--> statement-breakpoint
CREATE TABLE "video" (
	"id" text PRIMARY KEY NOT NULL,
	"raw_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"platform_type" text NOT NULL,
	"video_type" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"tags" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"link" text,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "video_raw_id_unique" UNIQUE("raw_id")
);
--> statement-breakpoint
CREATE TABLE "video_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"video_id" text NOT NULL,
	"lang_code" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_translation_video_id_lang_code_unique" UNIQUE("video_id","lang_code")
);
--> statement-breakpoint
ALTER TABLE "channel" ADD CONSTRAINT "channel_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_translation" ADD CONSTRAINT "creator_translation_creator_id_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_admin_message" ADD CONSTRAINT "discord_admin_message_channel_id_discord_channel_discord_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."discord_channel"("discord_channel_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_admin_message" ADD CONSTRAINT "discord_admin_message_message_id_discord_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."discord_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_channel" ADD CONSTRAINT "discord_channel_server_id_discord_server_discord_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."discord_server"("discord_server_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_status" ADD CONSTRAINT "stream_status_video_id_video_raw_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("raw_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video" ADD CONSTRAINT "video_channel_id_channel_platform_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("platform_channel_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_translation" ADD CONSTRAINT "video_translation_video_id_video_raw_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."video"("raw_id") ON DELETE cascade ON UPDATE no action;