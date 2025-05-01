CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"storage_file_id" text,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"visibility" text DEFAULT 'private' NOT NULL,
	"tags" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
