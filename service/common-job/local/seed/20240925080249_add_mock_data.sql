-- +goose Up
-- +goose StatementBegin

-- Insert mock data into the video table
INSERT INTO video (
    id, 
    channel_id, 
    platform_type, 
    title, 
    description, 
    video_type, 
    published_at, 
    tags, 
    thumbnail_url, 
    is_deleted
) VALUES
    ('video_001', 'UCPkKpOHxEDcwmUAnRpIu-Ng', 'youtube', '【藍沢エマ】新しいゲーム実況！', 'ゲーム実況の配信です', 'vspo_stream', CURRENT_TIMESTAMP - INTERVAL '3 days', 'ゲーム,実況', 'https://yt3.ggpht.com/sample1.jpg', FALSE),
    ('video_002', 'UC5LyYg6cCA4yHEYvtUsir3g', 'youtube', '【一ノ瀬うるは】雑談配信', '楽しい雑談配信', 'freechat', CURRENT_TIMESTAMP - INTERVAL '5 days', '雑談', 'https://yt3.ggpht.com/sample2.jpg', FALSE),
    ('video_003', 'UCzUNASdzI4PV5SlqtYwAkKQ', 'youtube', '【小森めと】クリップ集', 'ハイライトクリップ', 'clip', CURRENT_TIMESTAMP - INTERVAL '7 days', 'クリップ,ハイライト', 'https://yt3.ggpht.com/sample3.jpg', FALSE);

-- Insert mock data into the stream_status table
INSERT INTO stream_status (
    id, 
    video_id, 
    creator_id, 
    status, 
    started_at, 
    ended_at, 
    view_count, 
    updated_at
) VALUES
    ('status_001', 'video_001', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'live', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hours', 5000, CURRENT_TIMESTAMP),
    ('status_002', 'video_002', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'completed', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '5 hours', 8000, CURRENT_TIMESTAMP),
    ('status_003', 'video_003', '4028f731-9744-406d-a8ed-34ebcafb404c', 'upcoming', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 2 hours', 0, CURRENT_TIMESTAMP);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM stream_status WHERE id IN ('status_001', 'status_002', 'status_003');
DELETE FROM video WHERE id IN ('video_001', 'video_002', 'video_003');
-- +goose StatementEnd
