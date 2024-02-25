-- +goose Up
-- +goose StatementBegin

CREATE TABLE creator (
    id text PRIMARY KEY,
    name text NOT NULL,
    member_type text NOT NULL
);

CREATE TABLE channel (
    id text PRIMARY KEY,
    creator_id text NOT NULL,
    platform_name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    published_at timestamp with time zone NOT NULL,
    total_view_count integer NOT NULL,
    subscriber_count integer NOT NULL,
    hidden_subscriber_count boolean NOT NULL,
    total_video_count integer NOT NULL,
    thumbnail_url text NOT NULL,
    thumbnail_height integer NOT NULL,
    thumbnail_width integer NOT NULL,
    FOREIGN KEY (creator_id) REFERENCES Creator(id)
);

CREATE TABLE video (
    id text PRIMARY KEY,
    channel_id text NOT NULL,
    platform_name text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    stream_type text NOT NULL,
    published_at timestamp with time zone NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    status text NOT NULL,
    tags text NOT NULL,
    view_count integer NOT NULL,
    thumbnail_url text NOT NULL,
    thumbnail_height integer NOT NULL,
    thumbnail_width integer NOT NULL,
    FOREIGN KEY (channel_id) REFERENCES Channel(id)
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS video;
DROP TABLE IF EXISTS channel;
DROP TABLE IF EXISTS creator;

-- +goose StatementEnd
