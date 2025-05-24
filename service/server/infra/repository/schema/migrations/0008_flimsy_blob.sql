CREATE INDEX "clip_stats_view_count_desc_idx" ON "clip_stats" USING btree ("view_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "clip_stats_video_id_idx" ON "clip_stats" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "creator_translation_default_lang_creator_idx" ON "creator_translation" USING btree ("lang_code","creator_id");--> statement-breakpoint
CREATE INDEX "video_clips_filter_idx" ON "video" USING btree ("video_type","deleted","platform_type","published_at");--> statement-breakpoint
CREATE INDEX "video_published_at_idx" ON "video" USING btree ("published_at");