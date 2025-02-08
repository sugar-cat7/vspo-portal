CREATE TABLE IF NOT EXISTS "discord_admin_message" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_admin_message_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_admin_message_discord_admin_message_id_channel_id_unique" UNIQUE("discord_admin_message_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_bot_message" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_bot_message_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_bot_message_discord_bot_message_id_channel_id_unique" UNIQUE("discord_bot_message_id","channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_channel" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_channel_id" text NOT NULL,
	"server_id" text NOT NULL,
	"name" text NOT NULL,
	"lang_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_channel_discord_channel_id_unique" UNIQUE("discord_channel_id"),
	CONSTRAINT "discord_channel_discord_channel_id_server_id_unique" UNIQUE("discord_channel_id","server_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discord_server" (
	"id" text PRIMARY KEY NOT NULL,
	"discord_server_id" text NOT NULL,
	"name" text NOT NULL,
	"lang_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discord_server_discord_server_id_unique" UNIQUE("discord_server_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_admin_message" ADD CONSTRAINT "discord_admin_message_channel_id_discord_channel_discord_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."discord_channel"("discord_channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_bot_message" ADD CONSTRAINT "discord_bot_message_channel_id_discord_channel_discord_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."discord_channel"("discord_channel_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "discord_channel" ADD CONSTRAINT "discord_channel_server_id_discord_server_discord_server_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."discord_server"("discord_server_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
