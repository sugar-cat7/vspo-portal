ALTER TABLE "event" ADD COLUMN "started_date" text NOT NULL;--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "start_at";--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "end_at";