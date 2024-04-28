-- +goose Up
-- +goose StatementBegin
-- Create a table to store creator information
CREATE TABLE creator (
    id text PRIMARY KEY,
    -- Unique identifier for the creator
    name text NOT NULL,
    -- Name of the creator (e.g.  花芽なずな)
    member_type text NOT NULL -- Type of member (e.g. vspo_jp, vspo_en, general)
);
-- Create a table to store channel information
CREATE TABLE channel (
    id text PRIMARY KEY,
    -- Unique identifier for the channel
    platform_id text NOT NULL unique,
    -- Unique identifier for the channel on the platform
    creator_id text NOT NULL,
    -- Identifier for the creator of the channel
    platform_type text NOT NULL,
    -- Name of the platform (e.g. YouTube, Twitch)
    title text NOT NULL,
    -- Title of the channel
    description text NOT NULL,
    -- Description of the channel
    published_at timestamp with time zone NOT NULL,
    -- The date and time the channel was created
    total_view_count integer NOT NULL,
    -- Total number of views across all videos on the channel
    subscriber_count integer NOT NULL,
    -- Number of subscribers to the channel
    hidden_subscriber_count boolean NOT NULL,
    -- Whether the subscriber count is hidden
    total_video_count integer NOT NULL,
    -- Total number of videos uploaded to the channel
    thumbnail_url text NOT NULL,
    -- URL of the channel's thumbnail image
    is_deleted boolean NOT NULL,
    -- Flag indicating if the channel has been deleted
    FOREIGN KEY (creator_id) REFERENCES creator(id)
);
CREATE TABLE video (
    id text PRIMARY KEY,
    -- Unique identifier for the video
    channel_id text NOT NULL,
    -- Identifier for the channel the video belongs to
    platform_type text NOT NULL,
    -- Name of the platform (e.g. YouTube, Twitch)
    title text NOT NULL,
    -- Title of the video
    description text NOT NULL,
    -- Description of the video
    video_type text NOT NULL,
    -- Type of stream (e.g. vspo_broadcast, freechat, clip)
    published_at timestamp with time zone,
    -- The date and time the video was published
    started_at timestamp with time zone,
    -- The date and time the video started
    ended_at timestamp with time zone,
    -- The date and time the video ended
    broadcast_status text NOT NULL,
    -- Status of the video (e.g. live, upcoming)
    tags text NOT NULL,
    -- Tags associated with the video
    view_count integer NOT NULL,
    -- Number of views of the video
    thumbnail_url text NOT NULL,
    -- URL of the video's thumbnail image
    is_deleted boolean NOT NULL,
    -- Flag indicating if the video has been deleted
    FOREIGN KEY (channel_id) REFERENCES channel(platform_id)
);
-- Insert sample data into the 'creator' table
INSERT INTO creator (id, name, member_type)
VALUES ('1', '藍沢エマ', 'vspo_jp'),
    ('2', '空澄セナ', 'vspo_jp'),
    ('3', '一ノ瀬うるは', 'vspo_jp'),
    ('4', '花芽すみれ', 'vspo_jp'),
    ('5', '花芽なずな', 'vspo_jp'),
    ('6', '神成きゅぴ', 'vspo_jp'),
    ('7', '如月れん', 'vspo_jp'),
    ('8', '胡桃のあ', 'vspo_jp'),
    ('9', '小雀とと', 'vspo_jp'),
    ('10', '小森めと', 'vspo_jp'),
    ('11', '紫宮るな', 'vspo_jp'),
    ('12', '白波らむね', 'vspo_jp'),
    ('13', '橘ひなの', 'vspo_jp'),
    ('14', '兎咲ミミ', 'vspo_jp'),
    ('15', '猫汰つな', 'vspo_jp'),
    ('16', '英リサ', 'vspo_jp'),
    ('17', '八雲べに', 'vspo_jp'),
    ('18', '夢野あかり', 'vspo_jp'),
    ('19', 'ぶいすぽっ!【公式】', 'vspo_jp'),
    ('20', '夜乃くろむ', 'vspo_jp'),
    ('21', '紡木こかげ', 'vspo_jp'),
    ('22', '切り抜き師', 'general');
-- Insert sample data into the 'channel' table
INSERT INTO channel (
        id,
        platform_id,
        creator_id,
        platform_type,
        title,
        description,
        published_at,
        total_view_count,
        subscriber_count,
        hidden_subscriber_count,
        total_video_count,
        thumbnail_url,
        is_deleted
    )
VALUES (
        'uuid1',
        'UCPkKpOHxEDcwmUAnRpIu-Ng',
        '1',
        'youtube',
        '藍沢エマ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid2',
        '848822715',
        '1',
        'twitch',
        '藍沢エマ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid3',
        '1435560167794302978',
        '1',
        'twitcasting',
        '藍沢エマ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid4',
        'UCF_U2GCKHvDz52jWdizppIA',
        '2',
        'youtube',
        '空澄セナ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid5',
        'UC5LyYg6cCA4yHEYvtUsir3g',
        '3',
        'youtube',
        '一ノ瀬うるは',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid6',
        'UCyLGcqYs7RsBb3L0SJfzGYA',
        '4',
        'youtube',
        '花芽すみれ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid7',
        'UCiMG6VdScBabPhJ1ZtaVmbw',
        '5',
        'youtube',
        '花芽なずな',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid8',
        'UCMp55EbT_ZlqiMS3lCj01BQ',
        '6',
        'youtube',
        '神成きゅぴ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid9',
        'UCGWa1dMU_sDCaRQjdabsVgg',
        '7',
        'youtube',
        '如月れん',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid10',
        'UCIcAj6WkJ8vZ7DeJVgmeqKw',
        '8',
        'youtube',
        '胡桃のあ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid11',
        'UCgTzsBI0DIRopMylJEDqnog',
        '9',
        'youtube',
        '小雀とと',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid12',
        'UCzUNASdzI4PV5SlqtYwAkKQ',
        '10',
        'youtube',
        '小森めと',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid13',
        'UCD5W21JqNMv_tV9nfjvF9sw',
        '11',
        'youtube',
        '紫宮るな',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid14',
        'UC61OwuYOVuKkpKnid-43Twg',
        '12',
        'youtube',
        '白波らむね',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid15',
        'UCvUc0m317LWTTPZoBQV479A',
        '13',
        'youtube',
        '橘ひなの',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid16',
        'UCnvVG9RbOW3J6Ifqo-zKLiw',
        '14',
        'youtube',
        '兎咲ミミ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid17',
        'UCIjdfjcSaEgdjwbgjxC3ZWg',
        '15',
        'youtube',
        '猫汰つな',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid18',
        'UCurEA8YoqFwimJcAuSHU0MQ',
        '16',
        'youtube',
        '英リサ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid19',
        'UCjXBuHmWkieBApgBhDuJMMQ',
        '17',
        'youtube',
        '八雲べに',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid20',
        'UCS5l_Y0oMVTjEos2LuyeSZQ',
        '18',
        'youtube',
        '夢野あかり',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid21',
        'UCuI5XaO-6VkOEhHao6ij7JA',
        '19',
        'youtube',
        'ぶいすぽっ!【公式】',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid22',
        'UCX4WL24YEOUYd7qDsFSLDOw',
        '20',
        'youtube',
        '夜乃くろむ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    ),
    (
        'uuid23',
        'UC-WX1CXssCtCtc2TNIRnJzg',
        '21',
        'youtube',
        '紡木こかげ',
        '',
        '2021-01-01 00:00:00',
        1000000,
        100000,
        false,
        100,
        'https://example.com/thumbnail.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'RasCgfRnTOc',
        'UCgTzsBI0DIRopMylJEDqnog',
        'youtube',
        '▷ Free chat',
        'おはなししたり。ごじゆうに！



illustration(@kobakoba0_0)💛


はじめまして！VTuberの小雀ととです！
Lupinus Virtual Gamesに所属しています。
ゲームをメインに、歌ったりしながら活動してます！
仲良くしてくれると嬉しいです～！

▷チャンネル登録はこちら↓
https://bit.ly/2SYBLSt

▷メンバーシップ登録はこちら↓（iOSはブラウザのみ開けます）
https://www.youtube.com/channel/UCgTzsBI0DIRopMylJEDqnog/join

▷Lupinus Virtual Games
花芽すみれ👾💤
『 https://twitter.com/sumire_kaga 』
『 https://bit.ly/2NZ4VSZ 』
花芽なずな🍣
『 https://twitter.com/nazuna_kaga 』
『 https://bit.ly/2pqbVKL 』
小雀とと🔫🐥
『 https://twitter.com/toto_kogara 』
『 https://bit.ly/2IHB13t 』
一ノ瀬うるは🌠
『 https://twitter.com/uruha_ichinose 』
『 https://bit.ly/2Pv7drj 』

▷公式情報
Twitter
『 https://twitter.com/Vspo77 』
HP
『 http://lupinusvg.jp/ 』
Youtube
『 https://bit.ly/2IpeSEL 』

▷グッズ販売に関して
『 https://lupinusvg.booth.pm/ 』

▷ファンレターやプレゼントに関して
以下の、送り先にメンバー名記載の上お送りください。

郵便番号：154-0001
住所：東京都世田谷区池尻2-31-20 清水ビル5F
宛先：ぶいすぽ運営　小雀とと宛て

ご郵送前に下記リンク先の注意事項もご覧ください。
https://vspo.jp/faq/

▷使用デバイス(パソコン)
GALLERIA ZA9C-R37
【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
GALLERIA ぶいすぽっ！コラボPC特設ページ
https://00m.in/OFFdn
ゲーミングPC GALLERIAについては下記からチェック!
https://00m.in/a3ziJ',
        'freechat',
        '2020-07-23 19:32:36.000',
        '2024-10-10 10:10:00.000',
        NULL,
        'upcoming',
        '小雀とと,花芽なずな,花芽すみれ,花芽姉妹,PUBG,Apex,VTuber,一ノ瀬うるは,DBD,OW,ポケモン剣盾,あつ森,あつまれどうぶつの森',
        0,
        'https://i.ytimg.com/vi/RasCgfRnTOc/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'JkuHbeoqu64',
        'UCF_U2GCKHvDz52jWdizppIA',
        'youtube',
        '- フリフリチャット -',
        '▽ お願い .
　・話題に出てない活動者さんの名前を出すのは控えてください
　（箱内、外部関係なく控えてね）

　・ほかのチャンネルでは内輪ネタは控えてください

　・人を不快にさせるような発言はご遠慮下さい
　　(暴力的、性的、批判的な発言)

　・他のチャンネルで無闇に名前を出さないでください
　
☁••┈┈┈┈••☁••┈┈┈┈••☁••┈┈┈┈••☁••
▼ Twitter（ @sena_asumi ）
　 https://twitter.com/sena_asumi

▼membership登録はココ（月額490円）
https://www.youtube.com/channel/UCF_U2GCKHvDz52jWdizppIA/join


メンバー登録とは！ → 月額$4.99(約490円)を支払うことで
　　　　　　　　　　　  チャンネルのスポンサーになり
　　　　　　　　　　　  様々な特典を受け取ることができます！

☁••┈┈┈┈••☁••┈┈┈┈••☁••┈┈┈┈••☁••


▼ お問い合わせやプレゼント
　 〒154-0001
　 東京都世田谷区池尻2-31-20 清水ビル5F
     宛先：ぶいすぽ運営　空澄セナ宛',
        'freechat',
        '2020-07-23 17:08:12.000',
        '2024-07-19 21:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/JkuHbeoqu64/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'pT6aeI5S1Kk',
        'UCGWa1dMU_sDCaRQjdabsVgg',
        'youtube',
        '【ふりーちゃっと】れん帯責任しろ【ぶいすぽ/如月れん】',
        '皆もすなるふりちゃといふものを、私もしてみむとてするなり。

今のサムネ
おりんと 様
https://twitter.com/rint_rnt?s=20&t=PB-M32VfLO3xOic4TnkwpQ


▼使用デバイス(パソコン)
GALLERIA ZA9C-R37

【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
GALLERIA ぶいすぽっ！コラボPC特設ページ
https://www.dospara.co.jp/5gamepc/cts...

ゲーミングPC GALLERIAについては下記からチェック!
https://galleria.net/?utm_source=alli...

【ママ】
東西 様
Twitter
https://twitter.com/TZpoppin_phl95
Pixiv
https://www.pixiv.net/users/16347608

【配信画面】
ひよりん* 様
Twitter
https://twitter.com/hiyoooooorin
Youtube
https://www.youtube.com/channel/UCvcd...

【待機画面】
鮭澤鮪 様
Twitter
https://twitter.com/kai_zawa

【たまに流れてるBGM】
夏が爆ぜる/gozen reiji様
https://youtu.be/anYJPesPRYw

配信タグ:# 放れん送
ファンアートタグ（活動に使用させていただく場合がございます）:# れん絡帳
ファンネーム:# れん帯責任
推しマーク:⏰


〇いろんなリンク
【メンバーシップ登録】
https://www.youtube.com/channel/UCGWa...

【Twitter】
https://twitter.com/ren_kisaragi__

【ぶいすぽ公式Twitter】
https://twitter.com/Vspo77

【ぶいすぽ公式BOOTH】
https://lupinusvg.booth.pm/

【ぶいすぽ公式HP】
https://vspo.jp/

【お手紙やプレゼントはこちらまで】
〒154-0001
東京都世田谷区池尻2-31-20 清水ビル5F
ぶいすぽ運営　如月れん 宛て',
        'freechat',
        '2020-11-02 21:08:24.000',
        '2024-05-05 00:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/pT6aeI5S1Kk/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'lSvLABLEhO0',
        'UC5LyYg6cCA4yHEYvtUsir3g',
        'youtube',
        'ぽたく集会所',
        'ひまなときどうでもいいことを垂れ流す
みんなもちゃっとしていい

・配信視聴時に意識してくれたらありがたいこと
なによりもリスナー同士で強い言葉を使わないこと
リスナーも配信者も人間だということ


Twitter:https://twitter.com/uruha_ichinose
メンバーシップ登録:https://bit.ly/36eqXXZ

=======
▷使用デバイス(パソコン)
GALLERIA ZA9C-R37
【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
GALLERIA ぶいすぽっ！コラボPC特設ページ
https://www.dospara.co.jp/5gamepc/cts_collab_vspo
ゲーミングPC GALLERIAについては下記からチェック!
https://galleria.net/
=======


〚ファンレターやプレゼントに関して〛
郵便番号：154-0001
住所：東京都世田谷区池尻2-31-20 清水ビル5F
宛先：ぶいすぽ運営　一ノ瀬うるは宛て',
        'freechat',
        '2020-05-19 17:02:11.000',
        '2024-12-23 00:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/lSvLABLEhO0/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'CIRvsQ7XMoM',
        'UCvUc0m317LWTTPZoBQV479A',
        'youtube',
        '✧୨୧ Free Chat ୨୧✧',
        'ふりーとちゃっと

みんなでなかよくしてね🍫💘
人が嫌になるようなこめんとはしないこと！
たまにあそびにくる🐾',
        'freechat',
        '2020-08-17 23:21:27.000',
        '2025-11-11 00:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/CIRvsQ7XMoM/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'Rfuu2gkj18w',
        'UCD5W21JqNMv_tV9nfjvF9sw',
        'youtube',
        '🌙FreeしのみんChat🐾',
        'ぶいすぽっ！所属の 紫宮るな(shinomiya runa)です🌙

一緒に楽しいことしたいです！
よろしくお願いします🙇‍♀️

誕生日：2月22日
身長：147cm
好きなもの：ゲーム　猫　アイドル

💜Twitter　フォローしたらるな知りになれます
https://twitter.com/Runa_shinomiyA

💜Youtube　チャンネル登録してしのみんになってね
https://www.youtube.com/channel/UCD5W21JqNMv_tV9nfjvF9sw/about

💜メンバーシップ　限定の配信やスタンプしに来てね
https://www.youtube.com/channel/UCD5W21JqNMv_tV9nfjvF9sw/join

☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎

🌙ハッシュタグ
全部：#​​紫宮るな
配信：#るなるーむ
ファンアート：#るなぱれっと
ファンネーム：しのみん
ファンマーク：☪肉球

🌙illustrator 　西沢5㍉さん https://twitter.com/wanwangomigomi?s=20

🌙 Live2d　白沢飾音さん https://twitter.com/ShirasawaKazane?s=20

☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎

💜マウス感度
DPI:3200
APEX:0.4
VALORANT:0.126
Splatoon:3.5

💜使用デバイス
マウス:Finalmouse Starlight-12
キーボード:drunkdeer A75
マウスパット:X-raypad Aqua Control Zero
ヘッドホン:SONY MDR-H600A
パソコン:GALLERIA ZA9C-R37

【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
GALLERIA ぶいすぽっ！コラボPC特設ページ
https://www.dospara.co.jp/5gamepc/cts...
ゲーミングPC GALLERIAについては下記からチェック!
https://galleria.net/

☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎

⚠︎配信のお願い
・配信に関係のない内容のお話をしないでね。
・コメント欄での会話は控えてね。
・プレイ中のゲームなどのネタバレをしないでね。
・スナイプ・ゴースティングをしないでね。
・伝書鳩行為はしないでね。
（○○さんから来た！○○さんが終わったので！○○さんがこう言ってる！など)
・人を不快にさせるような発言はしないでね。
　　(暴力的・性的・批判的な発言など)
↪︎各自ブロックorスルーで自衛してね。
・配信中の切り抜きはるなのチャンネルがBANされる可能性があるから必ず終わったのを確認してからアップロードしてね。

コメントはしのみん以外にも見えてるよ📽
みんなで楽しい配信にしたいからルールを守ってくれると嬉しいです！！

☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎

📧お手紙やプレゼントはこちら📧

以下の送り先にメンバー名記載の上お送りください。

郵便番号：〒154-0001
住所　　：東京都世田谷区池尻2-31-20 清水ビル5F
お送り先：ぶいすぽっ！運営事務局　紫宮るな宛　　

⚠︎送るときのお約束
https://vspo.jp/faq/

💜ぶいすぽっ！公式　https://vspo.jp/

💜Twitter　https://twitter.com/Vspo77

☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎

🌙使用させていただいてる素材
Safuさん　https://www.youtube.com/c/SafuWorks/videos
柊 羽音さん　https://www.youtube.com/channel/UCir67pOSMAaswHt5dj47KDA
らぼわんさん　https://youtu.be/m19IOd9cCUE
しゃろうさん　https://www.youtube.com/channel/UCfjca6Z_wpyinTqHdIYJ49Q/videos',
        'freechat',
        '2021-12-28 10:29:15.000',
        '2024-02-22 02:22:43.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/Rfuu2gkj18w/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'CTFmzc2g4LU',
        'UC-WX1CXssCtCtc2TNIRnJzg',
        'youtube',
        'フリーチャット',
        '優しいコメント限定のフリーチャット

ꕤ･･· · • • •୨୧· · • • •⋈· · • • • ୨୧ • • • · ·⋈ • • • · ·୨୧• • • · ·･･ꕤ

ぶいすぽっ！所属のVTuber
紡木こかげ(Tsumugi Kokage)です！

FPSと食べることが大好き

X(旧Twitter) → https://twitter.com/kokage_tsumugi

誕生日 → 10月26日
身長 → 152cm
カラーコード → 5195E1

💧。⋈ 総合タグ → #紡木こかげ
💧。⋈ 配信タグ →  #こかげで一休み
💧。⋈ ファンアート → #つむぎふと
💧。⋈ ファンネーム → こもれびと
💧。⋈ 推しマーク →  📘💧


藤ちょこママ → https://twitter.com/fuzichoco
白沢飾音パパ → https://twitter.com/ShirasawaKazane

ꕤ･･· · • • •୨୧· · • • •⋈· · • • • ୨୧ • • • · ·⋈ • • • · ·୨୧• • • · ·･･ꕤ

💧。⋈メンバーシップ → https://www.youtube.com/channel/UC-WX1CXssCtCtc2TNIRnJzg/join

【メンバー特典】
1.名前の横にメンバーバッジが付きます
2.メンバー限定スタンプが使えます
3.こかげちゃんが喜びます

メンバー限定配信や、壁紙配布などは
いつかあるかもしれないし、ないかもしれません。

💧。⋈配信ルール
・スパチャ、メンバーシップ登録は反応出来ない場合があります
・暖かいコメント欄を心がける、みんな仲良くする

ꕤ･･· · • • •୨୧· · • • •⋈· · • • • ୨୧ • • • · ·⋈ • • • · ·୨୧• • • · ·･･ꕤ

Sens:1600/0.12
Mouse:GPRO X SUPERLIGHT 2
Mousepad:QCK HEAVY
Keyboard:APEX PRO MINI

ꕤ･･· · • • •୨୧· · • • •⋈· · • • • ୨୧ • • • · ·⋈ • • • · ·୨୧• • • · ·･･ꕤ

ぶいすぽっ！について

💧。⋈公式サイト → https://vspo.jp/
💧。⋈公式X(旧Twitter) → https://twitter.com/Vspo77
💧。⋈公式Youtubeチャンネル → https://www.youtube.com/channel/UCuI5XaO-6VkOEhHao6ij7JA
💧。⋈公式グッズ → https://store.vspo.jp/
💧。⋈二次創作ガイドライン → https://vspo.jp/guide

ファンレターやプレゼントの送り先
　〒154-0001
　東京都世田谷区池尻2-31-20 清水ビル5F
　ぶいすぽ運営　紡木こかげ宛

注意事項
→ https://vspo.jp/faq

ꕤ･･· · • • •୨୧· · • • •⋈· · • • • ୨୧ • • • · ·⋈ • • • · ·୨୧• • • · ·･･ꕤ

パソコン → GALLERIA ZA9C-R37
【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
  GALLERIA ぶいすぽっ！コラボPC特設ページ
https://www.dospara.co.jp/5info/cts_collab_vspo.html
  ゲーミングPC GALLERIAについては下記からチェック!
https://galleria.net/',
        'freechat',
        '2024-04-14 05:03:59.000',
        '2026-04-30 00:26:00.000',
        NULL,
        'upcoming',
        'ぶいすぽ新メンバー,ぶいすぽ新人,Vtuber,新人Vtuber,紡木こかげ,ぶいすぽっ！,VALORANT,FPS,ヴァロラント,コンペ,ソロコンペ',
        0,
        'https://i.ytimg.com/vi/CTFmzc2g4LU/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'bx1-cTN0Zas',
        'UCIcAj6WkJ8vZ7DeJVgmeqKw',
        'youtube',
        'Free Chat',
        'ｲﾗｽﾄ https://twitter.com/magchomp8

---

胡桃のあ (kurumi noah) です ♥︎

メンバーシップ
˹ https://www.youtube.com/channel/UCIcAj6WkJ8vZ7DeJVgmeqKw/join ˼
専用のスタンプとなまえの横に特別なバッジが付きます🧩

Twitter
˹ https://twitter.com/n0ah_kurumi ˼
タグ - #胡桃のあ #963art #なまのくるみ #963fam

Youtube
˹ https://www.youtube.com/c/noah963 ˼

マシュマロ
˹ https://marshmallow-qa.com/n0ah_kurumi?utm_medium=url_text&utm_source=promotion ˼

公式ホームページ
˹ http://lupinusvg.jp/ ˼

ぶいすぽっ！グッズなど
˹ URL：https://lupinusvg.booth.pm/ ˼

お問い合わせ、プレゼントなどは

郵便番号：154-0001
住所：東京都世田谷区池尻2-31-20 清水ビル5F
宛先：ぶいすぽ運営　胡桃のあ 宛て

-

愛用しているデバイス
マウス - Logicool G pro
キーボード - Logicool G Pro X
モニター - BenQ XL2411T
マウスパッド - Logicool G 240T
インターフェース - YAMAHA　AG03
マイク - audio technica AT2020',
        'freechat',
        '2020-06-24 00:45:01.000',
        '2025-02-13 03:30:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/bx1-cTN0Zas/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        '7-rmkxy7SSg',
        'UCjXBuHmWkieBApgBhDuJMMQ',
        'youtube',
        'Free chat',
        'ふりちゃです　たまにきたりもします

3周年記念グッズの受注販売が決定‼️

▶️受注期間
4月16日(火)〜4月30日(火)23:59まで

▶️ご購入はこちら
https://store.vspo.jp/products/yakumobeni-ani3rd

【グッズセット】
・タペストリー
・ステッカー&缶バッジセット
・キャップ
・箔押しポストカード

【※単品販売のみ】
・抱き枕カバー


メンバーシップ登録はこちらから↓
https://www.youtube.com/channel/UCjXBuHmWkieBApgBhDuJMMQ/join

୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧

　ぶいすぽっ！所属のvtuber 八雲べに（yakumo beni ）です〜！！

　オシャレとゲームと甘いものが大好き
　ぶいすぽのセクシー担当です！
　よろしくお願いします٩(^‿^)۶💚

　誕生日：9/25
　身長：158cm
　好きな食べ物：チョコミント　うな重
　好きなゲーム：valorant
　苦手なもの：ホラゲー

　💄ハッシュタグ

　総合→#八雲べに​​
　配信→#やくもーしょん​​
　ファンアート→#べにっき​​
　ファンネーム→#しもべに​​

　メンバーシップ💋
　https://www.youtube.com/channel/UCjXBuHmWkieBApgBhDuJMMQ/join

୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧

　💚メンバーシップはこちらから
　https://www.youtube.com/channel/UCjXBuHmWkieBApgBhDuJMMQ/join

　メンバーになったらどんなことがあるの？

　・名前の横にメンバー限定バッジが付くよ💄
　・メンバー限定の可愛いスタンプが使えます！
　・不定期で壁紙イラストを配布しています👙
　・記念ポスカが優先的にゲットできるかも...？
　・キャスのアーカイブ視聴ができるヨ！キャスもメン限でやることが多いです！
　・たま～に歌枠
　・映画の同時視聴🎬
　・【大特典】いぬべにの写真が見れる🐶
　・私が喜ぶ

୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧

　💗NEW! バレンタインボイス2023 でたよ～！
　　https://store.vspo.jp/products/vspo-valentinevoice2023

　✧ 過去ボイス ✧

　👙夏ボイス2021
　https://booth.pm/ja/items/3201777

　🍫バレンタインボイス2022
　https://booth.pm/ja/items/3655727

　🐬おでかけボイス2022
　https://lupinusvg.booth.pm/items/3983224

　🎄クリスマスボイス2022
https://store.vspo.jp/products/%E3%81%B6%E3%81%84%E3%81%99%E3%81%BD%E3%82%AF%E3%83%AA%E3%82%B9%E3%83%9E%E3%82%B92022-%E3%83%9C%E3%82%A4%E3%82%B9

୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧


　💚illustrator  MAIROママ♡
　　https://twitter.com/yasuabc0730​​​

　💚使用デバイス
　マウス：Logicool G PRO wireless superlight
　マウスパッド：Vaxee
　キーボード：G913 TKL
　モニター：ASUS ROG SWIFT PG258Q 24.5型 240Hz

   ▷パソコン
   GALLERIA ZA9C-R37
【ぶいすぽっ！ × GALLERIAコラボPC発売中！】
  GALLERIA ぶいすぽっ！コラボPC特設ページ
  https://www.dospara.co.jp/5gamepc/cts_collab_vspo
  ゲーミングPC GALLERIAについては下記からチェック!
  https://galleria.net/

　💚valo感度
　dpi 800  ゲーム内 0.26

　💚八雲べにTwitter
　https://twitter.com/beni_yakumo

　💚ぶいすぽっ！公式
 【HP】https://vspo.jp/​​​
 【Twitter】https://twitter.com/Vspo77​
【公式ECサイト】https://store.vspo.jp/

　💚プレゼントやファンレターに関して

　以下の送り先にメンバー名記載の上お送りください。

　郵便番号：〒154-0001
　住所　　：東京都世田谷区池尻2-31-20 清水ビル5F
　お送り先：ぶいすぽっ！運営事務局＿八雲べに宛　　

　※プレゼントするときのお約束※
　https://vspo.jp/faq/

୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧',
        'freechat',
        '2021-04-22 17:16:54.000',
        '2024-09-25 00:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/7-rmkxy7SSg/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'HC8rMmTWBGk',
        'UCIjdfjcSaEgdjwbgjxC3ZWg',
        'youtube',
        'フリーチャット🍒✨',
        '｡.｡:+* ﾟ ゜ﾟ *+:｡.｡:+* ﾟ ゜ﾟ *+:｡.｡.｡:+* ﾟ ゜ﾟ *+


🍒公式グッズ🍒
 https://lupinusvg.booth.pm/
グッズ、ボイスなど販売してまーす！




━━━━━━━━━━━━━━━


🍒twitter🍒
https://twitter.com/tsuna_nekota


ハッシュタグ #つな観 で呟いてくれると嬉しい ᗦ↞◃ 〜

メンバーシップ
https://www.youtube.com/channel/UCIjdfjcSaEgdjwbgjxC3ZWg/join


━━━━━━━━━━━━━━━


˗ˏˋ  配信のお約束　ˎˊ˗


✦誹謗中傷や荒らし、人を不快にさせるコメントはしないこと
➞現れても反応せず無視･ブロックで対応してね！
✦伝書鳩行為をしないこと！
他の配信でも、話題に上がってない時
つなの名前を出さないでくれるとうれしいかも～
✦スナイプやゴースティング行為をしないこと！
✦コメント欄での会話や喧嘩は抑えてね！


守れない人がいても注意などはしなくても大丈夫です！
みんなで楽しい配信にして行こう❤
　
━━━━━━━━━━━━━━━


ぶいすぽっ！所属の 猫汰つな(nekota tsuna)です！


色んなゲームで楽しむことが好き！
よろしくお願いいたします！


誕生日：11/27
身長：157cm
好きなもの：嫌いなもの以外全部！


🍒illustrator 泉彩パパ https://twitter.com/AC______


🍒Live2d　白沢飾音パパ https://twitter.com/ShirasawaKazane?s=20


━━━━━━━━━━━━━━━








🍒ぶいすぽっ！公式youtubeチャンネルもチェックしてね！
➞https://bit.ly/3vJ7QEx
ぶいすぽっ！公式サイト➞https://vspo.jp/
ぶいすぽっ！公式Twitter➞https://twitter.com/Vspo77


━━━━━━━━━━━━━━━


【ファンレターやプレゼントに関して】
以下の、送り先にメンバー名記載の上お送りください。


郵便番号：〒154-0001
住所：東京都世田谷区池尻2-31-20 清水ビル5F
宛先：ぶいすぽ運営　猫汰つな 宛


※送るときのお約束
https://vspo.jp/faq/


━━━━━━━━━━━━━━━


使用BGM


茶葉のぎか 様
https://www.youtube.com/channel/UCjxvxP6U-QAmnTLglGBwAFA


DOVA-SYNDROME
https://dova-s.jp/




｡.｡:+* ﾟ ゜ﾟ *+:｡.｡:+* ﾟ ゜ﾟ *+:｡.｡.｡:+* ﾟ ゜ﾟ *+',
        'freechat',
        '2022-08-11 19:36:25.000',
        '2023-12-31 23:45:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/HC8rMmTWBGk/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'l4_7qk5VE50',
        'UC61OwuYOVuKkpKnid-43Twg',
        'youtube',
        'FREE CHAT💙【白波らむね/ぶいすぽ】',
        '▼メンバーシップはこちら
https://www.youtube.com/channel/UC61OwuYOVuKkpKnid-43Twg/join

▼VALORANT
【感度】400dpi　0.53
【クロスヘア】1312　輪郭on　ホワイト

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

誕生日：３月２１日
身長：１５３ｃｍ
好きな物：海、たこ焼き、映画

💙twitter　https://twitter.com/Ramune_Shirana3

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

💙配信タグ　#らむね屋さん始めました
💙ファンアート　#らむねはいか画
💙ファンネーム　#波ノリ隊
💙エゴサ　#白波らむね

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

💙裕ママ　https://twitter.com/youcapriccio
💙白沢飾音パパ　https://twitter.com/ShirasawaKazane)

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

o○Fan letter＆Present

以下の送り先にメンバー名記載の上お送りください。
⚠︎送るときのお約束　https://vspo.jp/faq/

【住所】〒154-0001
　　　　東京都世田谷区池尻2-31-20 清水ビル5F
【宛先】ぶいすぽっ！運営事務局　白波らむね宛　　

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

o○ぶいすぽ公式

💙HP　https://vspo.jp/
💙Twitter　https://twitter.com/Vspo77
💙youtube　https://bit.ly/3vJ7QEx

⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰

o○使用BGM

Safu様　https://www.youtube.com/c/SafuWorks',
        'freechat',
        '2022-10-09 18:06:22.000',
        '2024-10-09 18:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/l4_7qk5VE50/default_live.jpg',
        false
    );
INSERT INTO video (
        id,
        channel_id,
        platform_type,
        title,
        description,
        video_type,
        published_at,
        started_at,
        ended_at,
        broadcast_status,
        tags,
        view_count,
        thumbnail_url,
        is_deleted
    )
VALUES(
        'uZduRVQgZgo',
        'UCurEA8YoqFwimJcAuSHU0MQ',
        'youtube',
        '【英リサ】free chatだよん',
        '💐暇な時におしゃべりしに来ます💐

はなぶさ りさ からのおねがい

・ちくちくことばをつかわない

いじょう',
        'freechat',
        '2020-08-16 21:55:21.000',
        '2023-09-01 15:00:00.000',
        NULL,
        'upcoming',
        '',
        0,
        'https://i.ytimg.com/vi/uZduRVQgZgo/default_live.jpg',
        false
    );
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS video;
DROP TABLE IF EXISTS channel;
DROP TABLE IF EXISTS creator;
-- +goose StatementEnd
