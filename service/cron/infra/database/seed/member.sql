-- vspo jp
INSERT INTO creator (id, name, member_type)
VALUES ('4f2b3fdb-8056-4e7a-acd0-44a674056aa0', '藍沢エマ', 'vspo_jp'),
    ('76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', '空澄セナ', 'vspo_jp'),
    ('627fbecd-30b6-4361-ac37-896ab33ac10f', '一ノ瀬うるは', 'vspo_jp'),
    ('4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', '花芽すみれ', 'vspo_jp'),
    ('e0edbe49-6872-440e-8683-5a718b782304', '花芽なずな', 'vspo_jp'),
    ('6d40a321-36e9-42df-a720-8e7dc4cc042b', '神成きゅぴ', 'vspo_jp'),
    ('77b59eaf-d22e-46d8-ade7-18d511da109b', '如月れん', 'vspo_jp'),
    ('e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', '胡桃のあ', 'vspo_jp'),
    ('25918d9f-8f1d-475d-bda6-abed279ef465', '小雀とと', 'vspo_jp'),
    ('4028f731-9744-406d-a8ed-34ebcafb404c', '小森めと', 'vspo_jp'),
    ('387aa612-86ba-4eac-baa4-e5aea2f11996', '紫宮るな', 'vspo_jp'),
    ('9c5b6926-43c6-44bf-8cbb-8f120732d5fe', '白波らむね', 'vspo_jp'),
    ('19103c02-5c44-4cae-b425-aec4fd3cc82d', '橘ひなの', 'vspo_jp'),
    ('70dc98ec-ae1b-4c18-b99f-657494c84de1', '兎咲ミミ', 'vspo_jp'),
    ('91c0ea12-970f-47f0-b539-48a010cdda2b', '猫汰つな', 'vspo_jp'),
    ('98416afe-4425-468a-ab7b-50375e70b592', '英リサ', 'vspo_jp'),
    ('1c8c7020-37ac-4467-9374-d81cd383af1f', '八雲べに', 'vspo_jp'),
    ('46a03fcf-8699-4857-a7e8-70c95a74715e', '夢野あかり', 'vspo_jp'),
    ('5781625d-87df-4281-98eb-3ce9a034e9f5', '夜乃くろむ', 'vspo_jp'),
    ('36bc2f5d-89b7-45a0-82ec-64e2902f3287', '紡木こかげ', 'vspo_jp'),
    ('022410b2-2d06-43c7-80cf-e8f888c3ab58', '千燈ゆうひ', 'vspo_jp'),
    ('de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'ぶいすぽっ!【公式】', 'vspo_jp');

-- channel youtube
INSERT INTO channel (
    id,
    platform_channel_id,
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
) VALUES
    ('243a4e2a-2849-4a4e-b96c-7873a6fc242e', 'UCPkKpOHxEDcwmUAnRpIu-Ng', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'youtube', '藍沢エマ / Aizawa Ema', 'ぶいすぽ所属の藍沢エマです🌸\n誕生日：1/31　水瓶座 ♒\n趣　味：ねこすい\n好きな食べ物：パン\nよろしくお願いします！\n\nTwitter（ https://twitter.com/Ema_Aizawa ）\nぶいすぽっ！運営（ https://twitter.com/Vspo77 ）\n\n', '2021-09-08T19:05:02.436204Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/oIps6UVvqtpJykcdjYYyRvhdcyVoR1wAdH8CnTp4msMaKYdn8XMLj4FHsLoqfWaJzbLJKSPjCg=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('eba9e5cf-d3e5-4597-8470-88574260c8f8', 'UCF_U2GCKHvDz52jWdizppIA', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'youtube', '空澄セナ -Asumi Sena-', '空高く羽ばたきたい。\nぶいすぽっ！ の 所属Vtuberの空澄セナ(Asumi Sena)です。\n\nゲーム.雑談.歌いろんな事します。\n活動を通して成長していきたいので、面倒みてやってください。\n\n\n【エゴサワード】#空澄セナ\n【生放送タグ】#うるセーナ\n【ファンネーム】#ぽぐもん\n【ファンアート】#空澄絵\n\n\n\n♠︎私について♠︎\n\n【Twitter】\nhttps://twitter.com/sena_asumi\n\n【オンラインショップ】\nhttps://lupinusvg.booth.pm/\n\n【お問い合わせ】\nhttps://vspo.jp/contact/\n\n【ぶいすぽっ！公式Twitter】\nhttps://twitter.com/Vspo77\n', '2020-07-15T19:19:27.207046Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/7M4bq-eX19nDu1Mzf6RWdHSpyCNP1USrfJ2oTfWgCTiIv31G3-7Sbdf4QzTRemQiEYRTEE0L9g=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('f994cf47-66fa-47d4-8925-c91cfb1f7d60', 'UC5LyYg6cCA4yHEYvtUsir3g', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'youtube', '一ノ瀬うるは', 'はじめまして、一ノ瀬うるはです。2019.4/19VTuberになりました。よろしくお願いします。\n(@Vspo77)所属。\n\n✦ゲームが好きです。FPSも好きだけどパズルゲームとかも好き、頭のひらめきは悪い。\n話すもの好きです。なんでもない話を一生します。\n\n✦メンバーシップURL：https://bit.ly/36eqXXZ\nメンバー特典について：不定期(月1程度）でメン限ツイキャス、雑談枠、映画同時視聴枠などを設けています。\nその他、メンバー限定スタンプやバッジなどが付きます。\n\n✦Lupinus Virtual Games \nMembers Twitter \n花芽すみれ(@sumire_kaga) \n花芽なずな(@nazuna_kaga) \n小雀とと(@toto_kogara) \n一ノ瀬うるは(@uruha_ichinose)\n\nぶいすぽ公式(@Vspo77)\n\n✦使用デバイス\nキーボード✦SteelSeries Apex Pro TKL\nマウス✦Logicool GPRO Wireless\nマウスパッド✦Mionix Alioth\nヘッドセット✦SteelSeries Arctis7\nマイク✦NEUMANN TLM 102', '2019-03-20T05:35:50Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/ytc/AIdro_myySkwnJbRZM78Ct6Zqok5H0oegoEjLOtg6sdq117VRAM=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('d87c444b-0721-493d-8322-48a93d5e59d1', 'UCyLGcqYs7RsBb3L0SJfzGYA', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'youtube', '花芽すみれ', 'おいす～花芽すみれです。\nゲームが好きです👾💤\n\n\n', '2018-09-21T06:29:47Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/0DwFdH37JTUBfKQqdg3U8EvUI3ohoG6KzpUx4dZLI5brWG8uC_D-IfrYA03eBwvfmEf26nRD_80=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('c394e6fa-c1a4-4f2b-a981-d6407dfb758e', 'UCiMG6VdScBabPhJ1ZtaVmbw', 'e0edbe49-6872-440e-8683-5a718b782304', 'youtube', '花芽なずな / Nazuna Kaga', 'ぶいすぽ所属　最年少！５歳可愛い担当花芽なずなです♡\n\n好きなゲームはFPS全般！\n↓主にプレイするゲーム\n【COD、PUBG、APEX、R6s、VALORANT、CSGO、スプラトゥーン、シャドーバース】\n\nよかったらチャンネル登録してね☆\n\n\n', '2018-09-20T11:41:24Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/HsgFKOFi-dN8VTnvRLV276FwW5PMR7Ynjxf_Rg1eKt9djmlU9zJXiaMBr7Bg7n0HCX2qsx9D=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('d0459654-1ed4-4e42-800b-5cac89b7a0fe', 'UCMp55EbT_ZlqiMS3lCj01BQ', '6d40a321-36e9-42df-a720-8e7dc4cc042b', 'youtube', '神成きゅぴ / Kaminari Qpi', '˗ˋˏ ぶいすぽっ！所属 ˎˊ˗\n　神成きゅぴ🌩(Kaminari Qpi）\n　 ↳ 褐色ギャルVtuber 5/18生まれ \n\nみんなに少しでも元気をお届けできたら神成はそれで幸せ～！\n仲良くしてね🤞\n', '2020-03-04T23:26:40.210267Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/aGHxz__F6cpkUBAEmbOgL1aHxwl8Xec6Z3qkGJlHg8zjUfUpw5V29ifuYJD3elGkhdI5tiaBSQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('9d63a1cf-4add-4a26-9bd9-511125d20734', 'UCGWa1dMU_sDCaRQjdabsVgg', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'youtube', '如月れん -Ren kisaragi-', 'ぶいすぽっ！Iris Black games所属 如月れん\n\n配信タグ:#放れん送\nファンアートタグ（活動に使用させていただく場合がございます）:#れん絡帳\n察しろ:#ポリエチれん\nファンネーム:#れん帯責任\n推しマーク:⏰\n\n\n〇いろんなリンク\n【メンバーシップ登録】\nhttps://www.youtube.com/channel/UCGWa1dMU_sDCaRQjdabsVgg/join\n\n【Twitter】\nhttps://twitter.com/ren_kisaragi__\n\n【マシュマロ】\nhttps://marshmallow-qa.com/ren_kisaragi__?utm_medium=url_text&utm_source=promotion\n\n【ぶいすぽ公式Twitter】\nhttps://twitter.com/Vspo77\n\n【ぶいすぽ公式BOOTH】\nhttps://lupinusvg.booth.pm/\n\n【ぶいすぽ公式HP】\nhttps://vspo.jp/\n\n【お手紙やプレゼントはこちらまで】\n〒154-0001\n東京都世田谷区池尻2-31-20 清水ビル5F\nぶいすぽ運営　如月れん 宛て\n', '2020-08-07T12:16:28.135443Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/U2M8O-qwS0vrjAr7nYk9y58xAV-I80eRn1jn1MX6pmsGcMdtUhMmgRekSAun2ca2Db7ntFuwwQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('1e4a4cd7-5ad3-4c50-bc02-899498421c53', 'UCIcAj6WkJ8vZ7DeJVgmeqKw', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'youtube', '胡桃のあ', '', '2020-02-01T07:20:25.340979Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/_BNEc4IHu2lbfF0QWQzRBJHaKmCyeBMUcJjX_SsDqPr6Tc9EX20ujJBQ1rmbLjqi7xRepR3oCw=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('a64c634a-08f6-41ba-b998-d3069907b00b', 'UCgTzsBI0DIRopMylJEDqnog', '25918d9f-8f1d-475d-bda6-abed279ef465', 'youtube', '小雀とと / Toto Kogara', 'はじめまして✨ぶいすぽっ！の小雀ととです☺\nゲームをメインに、歌ったりしながら活動してます！\n仲良くしてくれると嬉しいです～！\n\n\n▷チャンネル登録はこちら↓\nhttps://bit.ly/2SYBLSt\n\n▷メンバーシップ登録はこちら↓（iOSはブラウザのみ開けます）\nhttps://www.youtube.com/channel/UCgTzsBI0DIRopMylJEDqnog/join\n\n▷公式情報\nTwitter\n『 https://twitter.com/Vspo77 』\nHP\n『 https://vspo.jp/ 』\nYoutube\n『 https://bit.ly/2IpeSEL 』\nグッズ販売\n『 https://store.vspo.jp/ 』\n\n▷ファンレターやプレゼントに関して\n以下の、送り先にメンバー名記載の上お送りください。\n\n郵便番号：154-0001\n住所：東京都世田谷区池尻2-31-20 清水ビル5F\n宛先：ぶいすぽ運営　小雀とと宛て\n\nご郵送前に下記リンク先の注意事項もご覧ください。\nhttps://vspo.jp/faq/\n', '2019-03-13T09:09:32Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/ytc/AIdro_lEifEusAxSkqQg12z_wUO1bGfGIqo9Vv4OYz6X5BhCIg=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('caf508d3-a295-4234-b71d-c43fe161eab0', 'UCzUNASdzI4PV5SlqtYwAkKQ', '4028f731-9744-406d-a8ed-34ebcafb404c', 'youtube', 'Met Channel / 小森めと ', '小森めとです\n\n小森めとTwitter\nhttps://twitter.com/Met_Komori\n\nぶいすぽ公式(@Vspo77)\n', '2020-05-22T08:45:12.441244Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/t557GNcLS_5tgJCkbA7qaEs7XrogCmScjWRauTQRtknc7VXuGMF18YjeLVHFEarbkRN5pWOF=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('38850baf-fea3-493c-9cc0-ac2a44da53e0', 'UCD5W21JqNMv_tV9nfjvF9sw', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'youtube', '紫宮るな /shinomiya runa', 'はじめまして！\nぶいすぽっ！所属の 紫宮るな(shinomiya runa)です🌙\n\n一緒に楽しいことしたいです！\nよろしくお願いします🙇‍♀️\n\n誕生日：2月22日\n身長：147cm\n好きなもの：ゲーム　猫　アイドル\n\n💜Twitter　フォローしたらるな知りになれます\nhttps://twitter.com/Runa_shinomiyA\n\n💜Youtube　チャンネル登録してしのみんになってね\nhttps://www.youtube.com/channel/UCD5W...\n\n☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎\n\n🌙ハッシュタグ\n全部：#​​紫宮るな\n配信：#るなるーむ\nファンアート：#るなぱれっと\nファンネーム：しのみん\nファンマーク：☪肉球\n\n🌙illustrator 　西沢5㍉さん https://twitter.com/wanwangomigomi?s=20\n\n🌙 Live2d　白沢飾音さん https://twitter.com/ShirasawaKazane?s=20\n\n☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎☪︎┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈☪︎\n\n📧お手紙やプレゼントはこちら📧\n\n以下の送り先にメンバー名記載の上お送りください。\n\n郵便番号：〒154-0001\n住所　　：東京都世田谷区池尻2-31-20 清水ビル5F\nお送り先：ぶいすぽっ！運営事務局　紫宮るな宛　　\n\n⚠︎送るときのお約束\nhttps://vspo.jp/faq/\n\n💜ぶいすぽっ！公式　https://vspo.jp/\n\n💜Twitter　https://twitter.com/Vspo77\n\n', '2021-09-08T11:48:29.003709Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/nHOf1h_guQXgrCw-E3rDcEKV2r8wvOUys7_3lrvKsDWu-Fbf5VT_mBwCNglvWpaNGonWWjmcdQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('0c715b95-b480-4144-8518-b44cad790218', 'UC61OwuYOVuKkpKnid-43Twg', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'youtube', '白波らむね / Shiranami Ramune', 'ぶいすぽっ！所属Vtuberの 白波らむね(Shiranami Ramune)です！！！\n\n誕生日：３月２１日\n身長：１５３ｃｍ\n好きな物：海、たこ焼き、映画\n\n💙twitter　https://twitter.com/Ramune_Shirana3\n\n⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰\n.。o○Fan letter＆Present\n\n以下の送り先にメンバー名記載の上お送りください。\n⚠︎送るときのお約束　https://vspo.jp/faq/\n\n【住所】〒154-0001\n　　　　東京都世田谷区池尻2-31-20 清水ビル5F\n【宛先】ぶいすぽっ！運営事務局　白波らむね宛　　\n\n⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ \n\n.。o○ぶいすぽ公式\n\n💙HP　https://vspo.jp/\n💙Twitter　https://twitter.com/Vspo77\n💙youtube　https://bit.ly/3vJ7QEx\n\n⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ ⋱⋰ \n\n', '2022-08-14T12:58:46.359646Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/89CDsuDU9WD9o-_LQg1hqEvntFzihLLPnIx5mR4A0oBs0jc6pGV_aMdWz8CO3T-WbURePtdGbA=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('f1044d7e-555c-4214-baca-8b53245037e6', 'UCvUc0m317LWTTPZoBQV479A', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'youtube', '橘ひなの / Hinano Tachibana', '💜Twitter\nhttps://twitter.com/hinano_tachiba7\n\n୨୧･･･････････････････････････････୨୧୨୧･･･････････････････････････････୨୧\n\n【ぶいすぽっ！公式Twitter】\nhttps://twitter.com/Vspo77\n\n【グッズ販売に関して】\n\nURL：https://lupinusvg.booth.pm/\n\n【ファンレターやプレゼントに関して】\n\n〒154-0001\n東京都世田谷区池尻2-31-20 清水ビル5F\nぶいすぽ運営　橘 ひなの 宛て\n\n୨୧･･･････････････････････････････୨୧୨୧･･･････････････････････････････୨୧', '2020-08-04T14:42:35.971758Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/76a_ty_OwF-nJWNuuxxeJokcgqlmkKCHwXSto9cKKkyjPO2agiu5Tc7t4f6dz5uaab7X8U5mVQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('b601ccd8-55ff-4e6c-9ff3-dfcdb07d248c', 'UCnvVG9RbOW3J6Ifqo-zKLiw', '70dc98ec-ae1b-4c18-b99f-657494c84de1', 'youtube', '兎咲ミミ / Tosaki Mimi', 'はじめまして、ぶいすぽ所属の兎咲ミミです。\nゲーム配信をメインにいろいろな活動をしていきたいな～って思ってます。\nよかったらチャンネル登録してね！\n\n\n【ぶいすぽ運営】\n◇Twitter (@Vspo77)\n\n\n【グッズ販売に関して】\n\nURL：https://lupinusvg.booth.pm/\n\n【ファンレターやプレゼントに関して】\n郵便番号：154-0001\n住所：東京都世田谷区池尻2-31-20 清水ビル5F\n宛先：ぶいすぽ運営　兎咲ミミ宛て', '2020-06-30T06:34:57.450577Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/-qdF64Uazz9BmX8Njq61TDSOtMZSBtnQ303FKryqEMeE2qDhlpZNRbQNmPYKPCNvmPOCA1clhg=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('4d223a4d-3cba-4593-b2fd-e53b89346b72', 'UCIjdfjcSaEgdjwbgjxC3ZWg', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'youtube', '猫汰つな / Nekota Tsuna', 'ぶいすぽっ！所属の 猫汰つな(nekota tsuna)です！\n\n', '2022-06-12T09:25:19.595101Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/5cB1RxA8O44yMKNGvEMqvS3E1FaTloSC1GoTfY48kjAcxllPwyySVO9ioRoSfLSKFATLJycV=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('2ef9629f-96f5-4da7-a8de-74b462499f3a', 'UCurEA8YoqFwimJcAuSHU0MQ', '98416afe-4425-468a-ab7b-50375e70b592', 'youtube', '英リサ.Hanabusa Lisa', '💐バーチャルお嬢様の英(はなぶさ)リサです！💐\n6月3日生まれ 身長160㎝ \n趣味：お絵かき、ゲーム、おいしい食事\n貯蓄：5000000億\n\n見ている人が楽しくなるような配信を目指しています！よかったらTwitterとyoutubeのフォロー、チャンネル登録お願いします\nTwitter【https://twitter.com/Lisa_hanabusa 】\n\n所属先\nぶいすぽっ！【https://twitter.com/Vspo77 】\n\nファンレターやプレゼントに関して\n【https://is.gd/m7ylpV】', '2020-07-20T12:29:24.24497Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/ytc/AIdro_nDEKrUIjF9DlTu-bEc-DenqIj-md5YkUqhGhqwyBLBgQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('acfd20c3-ffae-49a5-89fb-c4959825a357', 'UCjXBuHmWkieBApgBhDuJMMQ', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'youtube', '八雲べに', '皆さん初めまして💄♡\nぶいすぽっ！所属の 八雲べに（yakumo beni ）です〜〜！！\n\nオシャレとゲームと甘いものが大好き💗\n\n皆さんと、楽しい時間を過ごしていきたいですっ！\nよろしくお願いします٩(^‿^)۶💚\n\n誕生日：9/25\n身長：158cm\n好きな食べ物：チョコミント　うな重\n\nTwitter💚https://twitter.com/beni_yakumo\n\nメンバーシップ💚https://www.youtube.com/channel/UCjXBuHmWkieBApgBhDuJMMQ/join', '2021-04-13T18:57:41.545729Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/v2me3hWW0qXxF5LEgag_o5HSr3m94U3OVXoq9t4_sKE8qRRhZahK_zf66b3XTvn6zXe8M44=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('1e049ca8-4837-4590-aa99-056cfcec9b5a', 'UCS5l_Y0oMVTjEos2LuyeSZQ', '46a03fcf-8699-4857-a7e8-70c95a74715e', 'youtube', 'Akari ch.夢野あかり', 'Twitter🍼https://twitter.com/AKARINdaooo\n\nTwitch🍼https://www.twitch.tv/akarindao\n\n\n', '2023-06-14T10:02:40.77048Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/oIDXQDZsMSTeGShVPE_-CAifw4duLe5z-8_6zhT3x3cenZq0KScM6UH0Y6Gva9k-p648YDrNMA=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('e49d7e98-aefa-43d0-aef4-e086ee89b25e', 'UCX4WL24YEOUYd7qDsFSLDOw', '5781625d-87df-4281-98eb-3ce9a034e9f5', 'youtube', '夜乃くろむ / Yano Kuromu', '', '2023-10-25T11:45:11.174878Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/s5yBpdTfsald7IesR0XOLBAE49k5P9e5aLqE6AsmPf2pb8GSQ9-srQz-eSiAUWrkfCTTcDZWZA=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('d1ddb87c-8946-4e93-9d8c-bf1f279d22ec', 'UC-WX1CXssCtCtc2TNIRnJzg', '36bc2f5d-89b7-45a0-82ec-64e2902f3287', 'youtube', '紡木こかげ', 'ぶいすぽっ！所属、紡木こかげです📘💧\nFPSと食べ物が大好き！\n', '2024-02-26T09:43:51.36885Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/uBemMrpiQtcdsbmAkxsCfyqr6lVkxa9FGwrs4URjOZgm97CbPDbilJBLcAy9SQYGfh8-__x7tw0=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('e75f0ea7-fc10-4832-8fd7-47279aa542ae', 'UCuDY3ibSP2MFRgf7eo3cojg', '022410b2-2d06-43c7-80cf-e8f888c3ab58', 'youtube', '千燈ゆうひ', 'ぶいすぽっ！所属、女子高生(?)担当、千燈ゆうひ(Sendo Yuuhi)です！\n\nあさ9時頃～よる18時間に配信をすることを得意としています🐠\nたまに夜にも配信するよ　日曜日は基本おやすみ！\n\n皆さんと一緒に楽しい時間を共有したいと思っています😳\nよろしくお願いいたします🌇\n\n身長 → 159cm\n誕生日 → 12月3日\n好きなもの → LoL、いろんなゲーム\nカラーコード → # ED784A\n\n有難いことにメンバーシップ登録用リンクをお探しの方へ👇\nhttps://www.youtube.com/channel/UCuDY3ibSP2MFRgf7eo3cojg/join\n', '2024-03-11T06:12:34.206844Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/Q5r7YGQy17IXQTQOCo9fzUb3LBVh4m61y5EPs6lulBRB0kedZEDfcp-_idAbfSiZ1Hbhp5jW=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('ca86af1a-143e-4ad0-8174-46344f025544', 'UCuI5XaO-6VkOEhHao6ij7JA', 'de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'youtube', 'ぶいすぽっ!【公式】', '「ぶいすぽっ！」は、ゲームに本気で取り組むメンバーが集まってesportsの良さを広げていく、\n次世代 Virtual eSports プロジェクトです。配信活動やesports大会への出場、\nアニメやコミックなど、様々なメディアミックスを展開しています。\n\nぶいすぽっ！公式チャンネルでは、公式番組やぶいすぽっ！に関する最新情報をお届けします。\n\n・Twitter\nhttps://twitter.com/Vspo77\n\n・Official HP\nhttps://vspo.jp/\n\n・お問合わせ\nhttps://vspo.jp/contact/\n\n・メンバーのtwitterアカウント\n花芽すみれ：https://twitter.com/sumire_kaga \n花芽なずな：https://twitter.com/nazuna_kaga \n小雀とと：https://twitter.com/toto_kogara \n一ノ瀬うるは：https://twitter.com/uruha_ichinose \n胡桃のあ：https://twitter.com/n0ah_kurumi \n橘ひなの：https://twitter.com/hinano_tachiba7 \n兎咲ミミ：https://twitter.com/mimi_tosaki \n空澄セナ：https://twitter.com/sena_asumi \n如月れん：https://twitter.com/ren_kisaragi__ \n英リサ：https://twitter.com/Lisa_hanabusa \n神成きゅぴ：https://twitter.com/xprprQchanx \n八雲べに：https://twitter.com/beni_yakumo \n藍沢エマ：https://twitter.com/Ema_Aizawa \n紫宮るな：https://twitter.com/Runa_shinomiya \n猫汰つな：https://twitter.com/tsuna_nekota \n白波らむね：https://twitter.com/Ramune_Shirana3 \n小森めと：https://twitter.com/Met_Komori\n夢野あかり：https://twitter.com/AKARINdaooo\n', '2019-01-02T09:01:38Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/dgFxRY6ACT5Qi3lM1j8YZPe_ZGH_pCRy2N_p5znoAE9mYTYYqUN64RGQvMnMqF4MDr-PKEQJyU8=s88-c-k-c0x00ffffff-no-rj', FALSE);

-- twitch
-- twitch channels
INSERT INTO channel (
    id,
    platform_channel_id,
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
) VALUES
    ('dabf6115-8a65-4b25-a01a-ce3b80a51b7f', '848822715', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'twitch', '藍沢エマ / Aizawa Ema', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/ema_aizawa-profile_image-70x70.png', FALSE),
    ('b9bc8d08-7c6b-4e60-a4a2-b67f0faf4480', '776751504', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'twitch', '空澄セナ -Asumi Sena-', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/sena_asumi-profile_image-70x70.png', FALSE),
    ('6a3303cb-a14f-4afd-9e5c-3c745c838d3c', '582689327', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'twitch', '一ノ瀬うるは', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/uruha_ichinose-profile_image-70x70.png', FALSE),
    ('2bd18be7-2701-4cf4-8152-8ad71b5c9f55', '695556933', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'twitch', '花芽すみれ', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/sumire_kaga-profile_image-70x70.png', FALSE),
    ('e5af70df-b3af-4e18-9d79-0a0c036a1b58', '790167759', 'e0edbe49-6872-440e-8683-5a718b782304', 'twitch', '花芽なずな / Nazuna Kaga', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/nazuna_kaga-profile_image-70x70.png', FALSE),
    ('1e397d9b-5937-4636-a24c-501b64e9fc74', '550676410', '6d40a321-36e9-42df-a720-8e7dc4cc042b', 'twitch', '神成きゅぴ / Kaminari Qpi', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/kaminari_qpi-profile_image-70x70.png', FALSE),
    ('67853058-c348-4211-8690-3338d1e6dc42', '722162135', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'twitch', '如月れん -Ren kisaragi-', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/ren_kisaragi-profile_image-70x70.png', FALSE),
    ('47e3b518-bbde-44eb-9b5c-a3ac132b5868', '600770697', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'twitch', '胡桃のあ', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/n0ah_kurumi-profile_image-70x70.png', FALSE),
    ('8f666a2f-e38b-447f-b403-4dea8394ae17', '801682194', '4028f731-9744-406d-a8ed-34ebcafb404c', 'twitch', '小森めと', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/toto_kogara-profile_image-70x70.png', FALSE),
    ('e7da915e-b5a1-4189-8e93-bcaa96f9b4bb', '773185713', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'twitch', '紫宮るな /shinomiya runa', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/runa_shinomiya-profile_image-70x70.png', FALSE),
    ('3abfb3a9-32eb-4f05-9e51-297387dd8810', '858359149', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'twitch', '白波らむね / Shiranami Ramune', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/ramune_shirana3-profile_image-70x70.png', FALSE),
    ('8781fd6f-7db5-48b4-a406-113f366c7203', '568682215', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'twitch', '橘ひなの / Hinano Tachibana', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/hinano_tachiba7-profile_image-70x70.png', FALSE),
    ('94fa663b-d5f3-475b-bd4e-226245f23336', '858359105', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'twitch', '猫汰つな / Nekota Tsuna', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/tsuna_nekota-profile_image-70x70.png', FALSE),
    ('36e28eab-ac5d-4e21-9fbc-5104f1117ebe', '777700650', '98416afe-4425-468a-ab7b-50375e70b592', 'twitch', '英リサ.Hanabusa Lisa', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/lisa_hanabusa-profile_image-70x70.png', FALSE),
    ('e3f9e253-f465-43b8-b083-2a334e2039df', '700465409', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'twitch', '八雲べに', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/beni_yakumo-profile_image-70x70.png', FALSE),
    ('42473eaf-2fc7-4b39-b7b9-a8cf38f18606', '584184005', '46a03fcf-8699-4857-a7e8-70c95a74715e', 'twitch', 'Akari ch.夢野あかり', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/akarindao-profile_image-70x70.png', FALSE),
    ('3e7f3c65-64fb-4723-aeee-9ed80b790364', '779969264', 'de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'twitch', 'ぶいすぽっ!【公式】', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.jtvnw.net/jtv_user_pictures/Vspo77-profile_image-70x70.png', FALSE);

-- twitcasting channels
INSERT INTO channel (
    id,
    platform_channel_id,
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
) VALUES
    ('4a0afe9d-8cdf-435c-a0fe-24d55e7c3384', '1435560167794302978', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'twitcasting', '藍沢エマ / Aizawa Ema', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/ema_aizawa-profile_image-70x70.png', FALSE),
    ('964a526c-0af3-47fd-833c-6758fefe3469', '1278069456359444480', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'twitcasting', '空澄セナ -Asumi Sena-', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/sena_asumi-profile_image-70x70.png', FALSE),
    ('d96ace8b-6044-40e0-921a-88312d68e07c', '1108236843466711043', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'twitcasting', '一ノ瀬うるは', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/uruha_ichinose-profile_image-70x70.png', FALSE),
    ('fd11fcd3-3d5f-49b9-ba6c-427b327be8a8', '1041915108069261313', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'twitcasting', '花芽すみれ', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/sumire_kaga-profile_image-70x70.png', FALSE),
    ('ced6d3a5-0f50-4c22-8969-66d52e0abb0a', '1041912206583984130', 'e0edbe49-6872-440e-8683-5a718b782304', 'twitcasting', '花芽なずな / Nazuna Kaga', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/nazuna_kaga-profile_image-70x70.png', FALSE),
    ('0f3d8bf5-7f43-4fdf-be34-593dc4d012f9', '1221690508273078277', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'twitcasting', '胡桃のあ', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/n0ah_kurumi-profile_image-70x70.png', FALSE),
    ('b75d79bf-560a-4780-981b-a0f3d7e5a4c8', '1105705824733687808', '25918d9f-8f1d-475d-bda6-abed279ef465', 'twitcasting', '小雀とと / Toto Kogara', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/toto_kogara-profile_image-70x70.png', FALSE),
    ('d8d3e324-0c6c-4247-97b8-25b15fdf3b7d', '1435565684881178633', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'twitcasting', '紫宮るな /shinomiya runa', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/runa_shinomiya-profile_image-70x70.png', FALSE),
    ('6e46a97b-6294-44bd-b2d0-19f97522804b', '1558536246456389632', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'twitcasting', '白波らむね / Shiranami Ramune', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/ramune_shirana3-profile_image-70x70.png', FALSE),
    ('aec9a21f-9aa9-40b2-8dfa-8fe72a07ef10', '1276939850885656576', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'twitcasting', '橘ひなの / Hinano Tachibana', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/hinano_tachiba7-profile_image-70x70.png', FALSE),
    ('78ba8022-08b9-4672-8c74-57a1bd0f3de7', '1535916492155678721', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'twitcasting', '猫汰つな / Nekota Tsuna', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/tsuna_nekota-profile_image-70x70.png', FALSE),
    ('b7f07261-f2aa-4243-9128-05f98792c669', '1274610375212711936', '98416afe-4425-468a-ab7b-50375e70b592', 'twitcasting', '英リサ.Hanabusa Lisa', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/lisa_hanabusa-profile_image-70x70.png', FALSE),
    ('b1443092-1160-4c43-be05-1c7d3823c26c', '1381969294624313344', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'twitcasting', '八雲べに', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/beni_yakumo-profile_image-70x70.png', FALSE),
    ('04bfdb9e-1af0-4605-a720-5e86061f6ce0', '1276920584299966465', '70dc98ec-ae1b-4c18-b99f-657494c84de1', 'twitcasting', '兎咲ミミ / Tosaki Mimi', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/mimi_tosaki-profile_image-70x70.png', FALSE),
    ('f5a0de4f-4578-415b-a0e1-9d39463001f3', '1276905650446979072', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'twitcasting', '如月れん', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/mimi_tosaki-profile_image-70x70.png', FALSE),
    ('66606cb6-68a1-48d8-8997-1d3db8feb6b0', '1258264128780554241', '4028f731-9744-406d-a8ed-34ebcafb404c', 'twitcasting', '小森めと', '', '2023-01-01T00:00:00Z', 0, 0, FALSE, 0, 'https://static-cdn.twitcasting.tv/mimi_tosaki-profile_image-70x70.png', FALSE);

-- freechat


-- vspo en
INSERT INTO creator (id, name, member_type)
VALUES ('e32cd370-c326-4ecf-b03b-611c96dea0d0', 'Remia Aotsuki', 'vspo_en'),
    ('f7f20a06-0766-4456-be2d-c77e601f7835', 'Jira Jisaki', 'vspo_jp'),
    ('8d8c4a35-3f24-4015-a06c-2224031ef225', 'Arya Kuroha', 'vspo_jp');

-- channel youtube
INSERT INTO channel (
    id,
    platform_channel_id,
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
) VALUES
    ('67de3145-2214-4ba6-a917-73192fd61384', 'UCeCWj-SiJG9SWN6wGORiLmw', 'f7f20a06-0766-4456-be2d-c77e601f7835', 'youtube', 'Jira Jisaki 【VSPO! EN】', 'almighty kaiju incoming!!! ⛰️ ', '2024-04-05T05:36:47.237925Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/-vNvJ64yYeDrjAKWz0z0atBNWSW_1p3lCRZjQpfzaKp3JvQY46focTOTXN3-uXAK65hcy31oOQ=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('69353c5c-519e-4774-93b6-8a326999cb25', 'UCLlJpxXt6L5d-XQ0cDdIyDQ', '8d8c4a35-3f24-4015-a06c-2224031ef225', 'youtube', 'Arya Kuroha 【VSPO! EN】', 'Potato Chips', '2024-04-05T05:35:30.682746Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/5mAqbF3j7cJ4DoAgcglo5lrnJaNR3uzyjAUf4UKi-ud3PA8gtdWL-rMAp45U4qNd-gV7mgww0co=s88-c-k-c0x00ffffff-no-rj', FALSE),
    ('94b0967a-02fe-4754-97a8-ea257af179d9', 'UCCra1t-eIlO3ULyXQQMD9Xw', 'e32cd370-c326-4ecf-b03b-611c96dea0d0', 'youtube', 'Remia Aotsuki 【VSPO! EN】', 'Sometimes GOD sometimes BOT\n︻デ═一⊹₊ ⋆ FPS, food, cute things\n\n☾⊹₊ ⋆ Remiao!  ฅ^•ﻌ•^ฅ\n\n@VSPO-EN', '2024-04-05T05:37:51.596369Z', 0, 0, FALSE, 0, 'https://yt3.ggpht.com/_ZXWSEkZc-HWDhMzW_uOCGqJPbnMKNzAUOx_28omus1sUw4YOb3qixY7fRzT7o5P_ONFzAfYqsU=s88-c-k-c0x00ffffff-no-rj', FALSE);

-- channel twitch

-- freechat
