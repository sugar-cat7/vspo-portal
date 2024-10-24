-- +goose Up
-- +goose StatementBegin

-- Create a table to store creator information
CREATE TABLE creator (
    id text PRIMARY KEY,          -- Unique identifier for the creator
    name text NOT NULL,           -- Name of the creator (e.g.  花芽なずな)
    member_type text NOT NULL     -- Type of member (e.g. vspo_jp, vspo_en, general)
);

-- Create a table to store channel information
CREATE TABLE channel (
    id text PRIMARY KEY,                          -- Unique identifier for the channel
    platform_channel_id text NOT NULL unique,     -- Identifier for the channel on the platform
    creator_id text NOT NULL,                     -- Identifier for the creator of the channel
    platform_type text NOT NULL,                  -- Name of the platform (e.g. YouTube, Twitch)
    title text NOT NULL,                          -- Title of the channel
    description text NOT NULL,                    -- Description of the channel
    published_at timestamp with time zone NOT NULL, -- The date and time the channel was created
    total_view_count integer NOT NULL,            -- Total number of views across all videos on the channel
    subscriber_count integer NOT NULL,            -- Number of subscribers to the channel
    hidden_subscriber_count boolean NOT NULL,     -- Whether the subscriber count is hidden
    total_video_count integer NOT NULL,           -- Total number of videos uploaded to the channel
    thumbnail_url text NOT NULL,                  -- URL of the channel's thumbnail image
    updated_at timestamp with time zone NOT NULL DEFAULT now(), -- The date and time the channel information was last updated
    is_deleted boolean NOT NULL,                  -- Flag indicating if the channel has been deleted
    FOREIGN KEY (creator_id) REFERENCES creator(id) ON DELETE CASCADE
);

CREATE TABLE video (
    id text PRIMARY KEY,                           -- Unique identifier for the video
    channel_id text NOT NULL,                      -- Identifier for the channel the video belongs to
    platform_type text NOT NULL,                   -- Name of the platform (e.g. YouTube, Twitch)
    title text NOT NULL,                           -- Title of the video
    description text NOT NULL,                     -- Description of the video
    video_type text NOT NULL,                      -- Type of stream (e.g. vspo_stream, freechat, clip)
    published_at timestamp with time zone NOT NULL,  -- The date and time the video was published
    tags text NOT NULL,                            -- Tags associated with the video
    thumbnail_url text NOT NULL,                   -- URL of the video's thumbnail image
    is_deleted boolean NOT NULL,                   -- Flag indicating if the video has been deleted
    FOREIGN KEY (channel_id) REFERENCES channel(platform_channel_id) ON DELETE CASCADE
);


-- Create a table to store the status of video streams
CREATE TABLE stream_status (
    id text PRIMARY KEY,            -- Unique identifier for the status
    video_id text NOT NULL,           -- Identifier for the video
    creator_id text NOT NULL,         -- Identifier for the creator
    status text NOT NULL,             -- Status of the video or creator (e.g. live, upcoming)
    started_at timestamp with time zone NOT NULL,    -- The date and time the video started
    ended_at timestamp with time zone NOT NULL,      -- The date and time the video ended
    view_count integer NOT NULL,                   -- Number of views of the video
    updated_at timestamp with time zone NOT NULL DEFAULT now(), -- When the status was last updated
    FOREIGN KEY (video_id) REFERENCES video(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES creator(id) ON DELETE CASCADE
);


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS video;
DROP TABLE IF EXISTS channel;
DROP TABLE IF EXISTS creator;
DROP TABLE IF EXISTS stream_status;

-- +goose StatementEnd
