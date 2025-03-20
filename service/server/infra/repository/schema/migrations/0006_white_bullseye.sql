CREATE TABLE "discord_message" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discord_bot_message" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "discord_bot_message" CASCADE;--> statement-breakpoint
ALTER TABLE "discord_admin_message" DROP CONSTRAINT "discord_admin_message_discord_admin_message_id_channel_id_unique";--> statement-breakpoint
ALTER TABLE "discord_admin_message" ADD COLUMN "message_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "discord_admin_message" ADD CONSTRAINT "discord_admin_message_message_id_discord_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."discord_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_admin_message" ADD CONSTRAINT "discord_admin_message_discord_admin_message_id_message_id_unique" UNIQUE("discord_admin_message_id","message_id");