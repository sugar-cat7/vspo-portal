CREATE INDEX "creator_translation_lang_code_idx" ON "creator_translation" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "video_video_type_idx" ON "video" USING btree ("video_type");--> statement-breakpoint
CREATE INDEX "video_deleted_idx" ON "video" USING btree ("deleted");--> statement-breakpoint
CREATE INDEX "video_translation_lang_code_idx" ON "video_translation" USING btree ("lang_code");