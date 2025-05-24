CREATE INDEX "channel_platform_channel_id_idx" ON "channel" USING btree ("platform_channel_id");--> statement-breakpoint
CREATE INDEX "channel_creator_id_idx" ON "channel" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "creator_translation_creator_id_idx" ON "creator_translation" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "stream_status_video_id_idx" ON "stream_status" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "stream_status_started_at_idx" ON "stream_status" USING btree ("started_at");