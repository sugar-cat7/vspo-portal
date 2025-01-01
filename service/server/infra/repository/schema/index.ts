import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Creator information table
export const creatorTable = pgTable('creator', {
  id: text('id').primaryKey(), // Unique identifier for the creator
  name: text('name').notNull(), // Creator's name
  memberType: text('member_type').notNull(), // Member type
  representativeThumbnailUrl: text('representative_thumbnail_url').notNull(), // Thumbnail image URL
});

// Channel information table
export const channelTable = pgTable('channel', {
  id: text('id').primaryKey(), // Unique identifier
  platformChannelId: text('platform_channel_id').notNull().unique(), // Channel ID on the platform
  creatorId: text('creator_id').notNull().references(() => creatorTable.id, { onDelete: 'cascade' }), // Creator ID
  platformType: text('platform_type').notNull(), // Platform type
  title: text('title').notNull(), // Channel title
  description: text('description').notNull(), // Channel description
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(), // Channel creation date and time
  subscriberCount: integer('subscriber_count').notNull(), // Number of channel subscribers
  thumbnailUrl: text('thumbnail_url').notNull(), // Channel's thumbnail URL
});

// Video information table
export const videoTable = pgTable('video', {
  id: text('id').primaryKey(), // Unique identifier
  channelId: text('channel_id').notNull().references(() => channelTable.platformChannelId, { onDelete: 'cascade' }), // Channel ID
  platformType: text('platform_type').notNull(), // Platform type
  title: text('title').notNull(), // Video title
  description: text('description').notNull(), // Video description
  videoType: text('video_type').notNull(), // Type of video
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull(), // Publication date and time
  tags: text('tags').notNull(), // Video tags
  thumbnailUrl: text('thumbnail_url').notNull(), // Video's thumbnail URL
});

// Stream status table
export const streamStatusTable = pgTable('stream_status', {
  id: text('id').primaryKey(), // Unique identifier
  videoId: text('video_id').notNull().references(() => videoTable.id, { onDelete: 'cascade' }), // Video ID
  status: text('status').notNull(), // Stream status
  startedAt: timestamp('started_at', { withTimezone: true }), // Start date and time
  endedAt: timestamp('ended_at', { withTimezone: true }), // End date and time
  viewCount: integer('view_count').notNull(), // View count
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(), // Last updated date and time
});

export type InsertCreator = typeof creatorTable.$inferInsert;
export type SelectCreator = typeof creatorTable.$inferSelect;

export type InsertChannel = typeof channelTable.$inferInsert;
export type SelectChannel = typeof channelTable.$inferSelect;

export type InsertVideo = typeof videoTable.$inferInsert;
export type SelectVideo = typeof videoTable.$inferSelect;

export type InsertStreamStatus = typeof streamStatusTable.$inferInsert;
export type SelectStreamStatus = typeof streamStatusTable.$inferSelect;

export const insertVideoSchema = createInsertSchema(videoTable);
export const selectVideoSchema = createSelectSchema(videoTable);
export const createInsertVideo = (data: InsertVideo) => insertVideoSchema.parse(data);

export const insertCreatorSchema = createInsertSchema(creatorTable);
export const selectCreatorSchema = createSelectSchema(creatorTable);

export const insertChannelSchema = createInsertSchema(channelTable);
export const selectChannelSchema = createSelectSchema(channelTable);

export const insertStreamStatusSchema = createInsertSchema(streamStatusTable);
export const selectStreamStatusSchema = createSelectSchema(streamStatusTable);
export const createInsertStreamStatus = (data: InsertStreamStatus) => insertStreamStatusSchema.parse(data);