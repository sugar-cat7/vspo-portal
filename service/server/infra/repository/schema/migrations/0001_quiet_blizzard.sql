-- vspo jp
INSERT INTO creator (id, member_type, representative_thumbnail_url)
VALUES ('4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'vspo_jp', ''),
    ('76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb','vspo_jp', ''),
    ('627fbecd-30b6-4361-ac37-896ab33ac10f', 'vspo_jp', ''),
    ('4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'vspo_jp', ''),
    ('e0edbe49-6872-440e-8683-5a718b782304', 'vspo_jp', ''),
    ('6d40a321-36e9-42df-a720-8e7dc4cc042b', 'vspo_jp', ''),
    ('77b59eaf-d22e-46d8-ade7-18d511da109b', 'vspo_jp', ''),
    ('e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'vspo_jp', ''),
    ('25918d9f-8f1d-475d-bda6-abed279ef465', 'vspo_jp', ''),
    ('4028f731-9744-406d-a8ed-34ebcafb404c', 'vspo_jp', ''),
    ('387aa612-86ba-4eac-baa4-e5aea2f11996', 'vspo_jp', ''),
    ('9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'vspo_jp', ''),
    ('19103c02-5c44-4cae-b425-aec4fd3cc82d', 'vspo_jp', ''),
    ('70dc98ec-ae1b-4c18-b99f-657494c84de1', 'vspo_jp', ''),
    ('91c0ea12-970f-47f0-b539-48a010cdda2b', 'vspo_jp', ''),
    ('98416afe-4425-468a-ab7b-50375e70b592', 'vspo_jp', ''),
    ('1c8c7020-37ac-4467-9374-d81cd383af1f', 'vspo_jp', ''),
    ('46a03fcf-8699-4857-a7e8-70c95a74715e', 'vspo_jp', ''),
    ('5781625d-87df-4281-98eb-3ce9a034e9f5', 'vspo_jp', ''),
    ('36bc2f5d-89b7-45a0-82ec-64e2902f3287', 'vspo_jp', ''),
    ('022410b2-2d06-43c7-80cf-e8f888c3ab58', 'vspo_jp', ''),
    ('06773781-e61b-4a5e-b1a7-7457d6d068ac', 'vspo_jp', ''),
    ('79b7f026-9981-4aed-a97a-fcf27dce8d3e', 'vspo_jp', ''),
    ('de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'vspo_jp', '');
--> statement-breakpoint
-- channel youtube
INSERT INTO channel (
    id,
    platform_channel_id,
    creator_id,
    platform_type,
    title,
    description,
    published_at,
    subscriber_count,
    thumbnail_url
) VALUES
    ('243a4e2a-2849-4a4e-b96c-7873a6fc242e', 'UCPkKpOHxEDcwmUAnRpIu-Ng', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'youtube', '藍沢エマ / Aizawa Ema', '', '2020-01-01T00:00:00Z', 0, ''),
    ('eba9e5cf-d3e5-4597-8470-88574260c8f8', 'UCF_U2GCKHvDz52jWdizppIA', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'youtube', '空澄セナ -Asumi Sena-', '', '2020-01-01T00:00:00Z', 0, ''),
    ('f994cf47-66fa-47d4-8925-c91cfb1f7d60', 'UC5LyYg6cCA4yHEYvtUsir3g', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'youtube', '一ノ瀬うるは', '', '2020-01-01T00:00:00Z', 0, ''),
    ('d87c444b-0721-493d-8322-48a93d5e59d1', 'UCyLGcqYs7RsBb3L0SJfzGYA', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'youtube', '花芽すみれ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('c394e6fa-c1a4-4f2b-a981-d6407dfb758e', 'UCiMG6VdScBabPhJ1ZtaVmbw', 'e0edbe49-6872-440e-8683-5a718b782304', 'youtube', '花芽なずな / Nazuna Kaga', '', '2020-01-01T00:00:00Z', 0, ''),
    ('d0459654-1ed4-4e42-800b-5cac89b7a0fe', 'UCMp55EbT_ZlqiMS3lCj01BQ', '6d40a321-36e9-42df-a720-8e7dc4cc042b', 'youtube', '神成きゅぴ / Kaminari Qpi', '', '2020-01-01T00:00:00Z', 0, ''),
    ('9d63a1cf-4add-4a26-9bd9-511125d20734', 'UCGWa1dMU_sDCaRQjdabsVgg', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'youtube', '如月れん -Ren kisaragi-', '', '2020-01-01T00:00:00Z', 0, ''),
    ('1e4a4cd7-5ad3-4c50-bc02-899498421c53', 'UCIcAj6WkJ8vZ7DeJVgmeqKw', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'youtube', '胡桃のあ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('a64c634a-08f6-41ba-b998-d3069907b00b', 'UCgTzsBI0DIRopMylJEDqnog', '25918d9f-8f1d-475d-bda6-abed279ef465', 'youtube', '小雀とと / Toto Kogara', '', '2020-01-01T00:00:00Z', 0, ''),
    ('caf508d3-a295-4234-b71d-c43fe161eab0', 'UCzUNASdzI4PV5SlqtYwAkKQ', '4028f731-9744-406d-a8ed-34ebcafb404c', 'youtube', 'Met Channel / 小森めと ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('0c715b95-b480-4144-8518-b44cad790218', 'UC61OwuYOVuKkpKnid-43Twg', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'youtube', '白波らむね / Shiranami Ramune', '', '2020-01-01T00:00:00Z', 0, ''),
    ('4df80d7d-4c63-4fc4-a839-0e2cb5521fa8', 'UCD5W21JqNMv_tV9nfjvF9sw', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'youtube', '紫宮るな /shinomiya runa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('f1044d7e-555c-4214-baca-8b53245037e6', 'UCvUc0m317LWTTPZoBQV479A', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'youtube', '橘ひなの / Hinano Tachibana', '', '2020-01-01T00:00:00Z', 0, ''),
    ('b601ccd8-55ff-4e6c-9ff3-dfcdb07d248c', 'UCnvVG9RbOW3J6Ifqo-zKLiw', '70dc98ec-ae1b-4c18-b99f-657494c84de1', 'youtube', '兎咲ミミ / Tosaki Mimi', '', '2020-01-01T00:00:00Z', 0, ''),
    ('4d223a4d-3cba-4593-b2fd-e53b89346b72', 'UCIjdfjcSaEgdjwbgjxC3ZWg', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'youtube', '猫汰つな / Nekota Tsuna', '', '2020-01-01T00:00:00Z', 0, ''),
    ('2ef9629f-96f5-4da7-a8de-74b462499f3a', 'UCurEA8YoqFwimJcAuSHU0MQ', '98416afe-4425-468a-ab7b-50375e70b592', 'youtube', '英リサ.Hanabusa Lisa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('acfd20c3-ffae-49a5-89fb-c4959825a357', 'UCjXBuHmWkieBApgBhDuJMMQ', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'youtube', '八雲べに', '', '2020-01-01T00:00:00Z', 0, ''),
    ('1e049ca8-4837-4590-aa99-056cfcec9b5a', 'UCS5l_Y0oMVTjEos2LuyeSZQ', '46a03fcf-8699-4857-a7e8-70c95a74715e', 'youtube', 'Akari ch.夢野あかり', '', '2020-01-01T00:00:00Z', 0, ''),
    ('e49d7e98-aefa-43d0-aef4-e086ee89b25e', 'UCX4WL24YEOUYd7qDsFSLDOw', '5781625d-87df-4281-98eb-3ce9a034e9f5', 'youtube', '夜乃くろむ / Yano Kuromu', '', '2020-01-01T00:00:00Z', 0, ''),
    ('d1ddb87c-8946-4e93-9d8c-bf1f279d22ec', 'UC-WX1CXssCtCtc2TNIRnJzg', '36bc2f5d-89b7-45a0-82ec-64e2902f3287', 'youtube', '紡木こかげ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('e75f0ea7-fc10-4832-8fd7-47279aa542ae', 'UCuDY3ibSP2MFRgf7eo3cojg', '022410b2-2d06-43c7-80cf-e8f888c3ab58', 'youtube', '千燈ゆうひ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('ea0372cf-8137-4f17-b6a2-ae49cdafad9c', 'UCL9hJsdk9eQa0IlWbFB2oRg', '06773781-e61b-4a5e-b1a7-7457d6d068ac', 'youtube', '蝶屋はなび', '', '2020-01-01T00:00:00Z', 0, ''),
    ('6364d567-8b74-469b-9ca6-7cee95dc8476', 'UC8vKBjGY2HVfbW9GAmgikWw', '79b7f026-9981-4aed-a97a-fcf27dce8d3e', 'youtube', '甘結もか', '', '2020-01-01T00:00:00Z', 0, ''),
    ('ca86af1a-143e-4ad0-8174-46344f025544', 'UCuI5XaO-6VkOEhHao6ij7JA', 'de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'youtube', 'ぶいすぽっ!【公式】', '', '2020-01-01T00:00:00Z', 0, '');
--> statement-breakpoint
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
    subscriber_count,
    thumbnail_url
) VALUES
    ('dabf6115-8a65-4b25-a01a-ce3b80a51b7f', '848822715', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'twitch', '藍沢エマ / Aizawa Ema', '', '2020-01-01T00:00:00Z', 0, ''),
    ('b9bc8d08-7c6b-4e60-a4a2-b67f0faf4480', '776751504', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'twitch', '空澄セナ -Asumi Sena-', '', '2020-01-01T00:00:00Z', 0, ''),
    ('6a3303cb-a14f-4afd-9e5c-3c745c838d3c', '582689327', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'twitch', '一ノ瀬うるは', '', '2020-01-01T00:00:00Z', 0, ''),
    ('2bd18be7-2701-4cf4-8152-8ad71b5c9f55', '695556933', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'twitch', '花芽すみれ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('e5af70df-b3af-4e18-9d79-0a0c036a1b58', '790167759', 'e0edbe49-6872-440e-8683-5a718b782304', 'twitch', '花芽なずな / Nazuna Kaga', '', '2020-01-01T00:00:00Z', 0, ''),
    ('1e397d9b-5937-4636-a24c-501b64e9fc74', '550676410', '6d40a321-36e9-42df-a720-8e7dc4cc042b', 'twitch', '神成きゅぴ / Kaminari Qpi', '', '2020-01-01T00:00:00Z', 0, ''),
    ('67853058-c348-4211-8690-3338d1e6dc42', '722162135', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'twitch', '如月れん -Ren kisaragi-', '', '2020-01-01T00:00:00Z', 0, ''),
    ('47e3b518-bbde-44eb-9b5c-a3ac132b5868', '600770697', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'twitch', '胡桃のあ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('8f666a2f-e38b-447f-b403-4dea8394ae17', '801682194', '4028f731-9744-406d-a8ed-34ebcafb404c', 'twitch', '小森めと', '', '2020-01-01T00:00:00Z', 0, ''),
    ('e7da915e-b5a1-4189-8e93-bcaa96f9b4bb', '773185713', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'twitch', '紫宮るな /shinomiya runa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('3abfb3a9-32eb-4f05-9e51-297387dd8810', '858359149', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'twitch', '白波らむね / Shiranami Ramune', '', '2020-01-01T00:00:00Z', 0, ''),
    ('8781fd6f-7db5-48b4-a406-113f366c7203', '568682215', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'twitch', '橘ひなの / Hinano Tachibana', '', '2020-01-01T00:00:00Z', 0, ''),
    ('94fa663b-d5f3-475b-bd4e-226245f23336', '858359105', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'twitch', '猫汰つな / Nekota Tsuna', '', '2020-01-01T00:00:00Z', 0, ''),
    ('36e28eab-ac5d-4e21-9fbc-5104f1117ebe', '777700650', '98416afe-4425-468a-ab7b-50375e70b592', 'twitch', '英リサ.Hanabusa Lisa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('e3f9e253-f465-43b8-b083-2a334e2039df', '700465409', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'twitch', '八雲べに', '', '2020-01-01T00:00:00Z', 0, ''),
    ('42473eaf-2fc7-4b39-b7b9-a8cf38f18606', '584184005', '46a03fcf-8699-4857-a7e8-70c95a74715e', 'twitch', 'Akari ch.夢野あかり', '', '2020-01-01T00:00:00Z', 0, ''),
    ('3e7f3c65-64fb-4723-aeee-9ed80b790364', '779969264', 'de2ad13d-f01f-4e93-8431-888ed00cfb6e', 'twitch', 'ぶいすぽっ!【公式】', '', '2020-01-01T00:00:00Z', 0, '');
--> statement-breakpoint
-- twitcasting channels
INSERT INTO channel (
    id,
    platform_channel_id,
    creator_id,
    platform_type,
    title,
    description,
    published_at,
    subscriber_count,
    thumbnail_url
) VALUES
    ('4a0afe9d-8cdf-435c-a0fe-24d55e7c3384', '1435560167794302978', '4f2b3fdb-8056-4e7a-acd0-44a674056aa0', 'twitcasting', '藍沢エマ / Aizawa Ema', '', '2020-01-01T00:00:00Z', 0, ''),
    ('964a526c-0af3-47fd-833c-6758fefe3469', '1278069456359444480', '76ccfc57-a6eb-4ebd-9b61-ad48c5f7a7eb', 'twitcasting', '空澄セナ -Asumi Sena-', '', '2020-01-01T00:00:00Z', 0, ''),
    ('d96ace8b-6044-40e0-921a-88312d68e07c', '1108236843466711043', '627fbecd-30b6-4361-ac37-896ab33ac10f', 'twitcasting', '一ノ瀬うるは', '', '2020-01-01T00:00:00Z', 0, ''),
    ('fd11fcd3-3d5f-49b9-ba6c-427b327be8a8', '1041915108069261313', '4a5b48a6-7c25-499b-9c9f-bfdfa1223bd8', 'twitcasting', '花芽すみれ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('ced6d3a5-0f50-4c22-8969-66d52e0abb0a', '1041912206583984130', 'e0edbe49-6872-440e-8683-5a718b782304', 'twitcasting', '花芽なずな / Nazuna Kaga', '', '2020-01-01T00:00:00Z', 0, ''),
    ('0f3d8bf5-7f43-4fdf-be34-593dc4d012f9', '1221690508273078277', 'e650688f-2ff1-4d7f-9b2d-8b976b0b7e45', 'twitcasting', '胡桃のあ', '', '2020-01-01T00:00:00Z', 0, ''),
    ('b75d79bf-560a-4780-981b-a0f3d7e5a4c8', '1105705824733687808', '25918d9f-8f1d-475d-bda6-abed279ef465', 'twitcasting', '小雀とと / Toto Kogara', '', '2020-01-01T00:00:00Z', 0, ''),
    ('d8d3e324-0c6c-4247-97b8-25b15fdf3b7d', '1435565684881178633', '387aa612-86ba-4eac-baa4-e5aea2f11996', 'twitcasting', '紫宮るな /shinomiya runa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('6e46a97b-6294-44bd-b2d0-19f97522804b', '1558536246456389632', '9c5b6926-43c6-44bf-8cbb-8f120732d5fe', 'twitcasting', '白波らむね / Shiranami Ramune', '', '2020-01-01T00:00:00Z', 0, ''),
    ('aec9a21f-9aa9-40b2-8dfa-8fe72a07ef10', '1276939850885656576', '19103c02-5c44-4cae-b425-aec4fd3cc82d', 'twitcasting', '橘ひなの / Hinano Tachibana', '', '2020-01-01T00:00:00Z', 0, ''),
    ('78ba8022-08b9-4672-8c74-57a1bd0f3de7', '1535916492155678721', '91c0ea12-970f-47f0-b539-48a010cdda2b', 'twitcasting', '猫汰つな / Nekota Tsuna', '', '2020-01-01T00:00:00Z', 0, ''),
    ('b7f07261-f2aa-4243-9128-05f98792c669', '1274610375212711936', '98416afe-4425-468a-ab7b-50375e70b592', 'twitcasting', '英リサ.Hanabusa Lisa', '', '2020-01-01T00:00:00Z', 0, ''),
    ('b1443092-1160-4c43-be05-1c7d3823c26c', '1381969294624313344', '1c8c7020-37ac-4467-9374-d81cd383af1f', 'twitcasting', '八雲べに', '', '2020-01-01T00:00:00Z', 0, ''),
    ('04bfdb9e-1af0-4605-a720-5e86061f6ce0', '1276920584299966465', '70dc98ec-ae1b-4c18-b99f-657494c84de1', 'twitcasting', '兎咲ミミ / Tosaki Mimi', '', '2020-01-01T00:00:00Z', 0, ''),
    ('f5a0de4f-4578-415b-a0e1-9d39463001f3', '1276905650446979072', '77b59eaf-d22e-46d8-ade7-18d511da109b', 'twitcasting', '如月れん', '', '2020-01-01T00:00:00Z', 0, ''),
    ('66606cb6-68a1-48d8-8997-1d3db8feb6b0', '1258264128780554241', '4028f731-9744-406d-a8ed-34ebcafb404c', 'twitcasting', '小森めと', '', '2020-01-01T00:00:00Z', 0, '');

-- freechat

--> statement-breakpoint
-- vspo en
INSERT INTO creator (id, member_type, representative_thumbnail_url)
VALUES ('e32cd370-c326-4ecf-b03b-611c96dea0d0', 'vspo_en', ''),
    ('f7f20a06-0766-4456-be2d-c77e601f7835', 'vspo_en', ''),
    ('8d8c4a35-3f24-4015-a06c-2224031ef225', 'vspo_en', ''),
    ('4d4bc95e-da73-4a1e-bdf5-22de69902ec7', 'vspo_en', ''),
    ('2d412502-234e-4c70-b1ed-2ef28bb2f968', 'vspo_en', '');

--> statement-breakpoint
-- channel youtube
INSERT INTO channel (
    id,
    platform_channel_id,
    creator_id,
    platform_type,
    title,
    description,
    published_at,
    subscriber_count,
    thumbnail_url
) VALUES
    ('67de3145-2214-4ba6-a917-73192fd61384', 'UCeCWj-SiJG9SWN6wGORiLmw', 'f7f20a06-0766-4456-be2d-c77e601f7835', 'youtube', 'Jira Jisaki 【VSPO! EN】', '', '2020-01-01T00:00:00Z', 0, ''),
    ('69353c5c-519e-4774-93b6-8a326999cb25', 'UCLlJpxXt6L5d-XQ0cDdIyDQ', '8d8c4a35-3f24-4015-a06c-2224031ef225', 'youtube', 'Arya Kuroha 【VSPO! EN】', '', '2020-01-01T00:00:00Z', 0, ''),
    ('94b0967a-02fe-4754-97a8-ea257af179d9', 'UCCra1t-eIlO3ULyXQQMD9Xw', 'e32cd370-c326-4ecf-b03b-611c96dea0d0', 'youtube', 'Remia Aotsuki 【VSPO! EN】', '', '2020-01-01T00:00:00Z', 0, ''),
    ('62614b90-3994-42d8-ac66-b14ee92df7cf', 'UCKSpM183c85d5V2cW5qaUjA', '4d4bc95e-da73-4a1e-bdf5-22de69902ec7', 'youtube', 'Narin Mikure 【VSPO! EN】', '', '2020-01-01T00:00:00Z', 0, ''),
    ('79339f4f-8719-4d67-8fc9-a032af3c0978', 'UC7Xglp1fske9zmRe7Oj8YyA', '2d412502-234e-4c70-b1ed-2ef28bb2f968', 'youtube', 'Riko Solari 【VSPO! EN】', '', '2020-01-01T00:00:00Z', 0, '');
--> statement-breakpoint
-- channel twitch
INSERT INTO channel (
    id,
    platform_channel_id,
    creator_id,
    platform_type,
    title,
    description,
    published_at,
    subscriber_count,
    thumbnail_url
) VALUES
    ('845167f5-a411-460c-a40c-7462e69ff6ad', '1102212264', 'f7f20a06-0766-4456-be2d-c77e601f7835', 'twitch', 'Jira Jisaki', '', '2020-01-01T00:00:00Z', 0, ''),
    ('99f72cef-6473-4fb0-837d-efb9437f637e', '1102211983', '8d8c4a35-3f24-4015-a06c-2224031ef225', 'twitch', 'Arya Kuroha', '', '2020-01-01T00:00:00Z', 0, ''),
    ('2670033d-0d25-47c0-bc60-9faa76e02f00', '1102206195', 'e32cd370-c326-4ecf-b03b-611c96dea0d0', 'twitch', 'Remia Aotsuki', '', '2020-01-01T00:00:00Z', 0, ''),
    ('7772106f-137b-436a-8ad8-f90daa5f4f45', '1125214436', '4d4bc95e-da73-4a1e-bdf5-22de69902ec7', 'twitch', 'Narin Mikure', '', '2020-01-01T00:00:00Z', 0, ''),
    ('6d534e57-f1f2-4027-8d3e-4513924b0a90', '1125216387', '2d412502-234e-4c70-b1ed-2ef28bb2f968', 'twitch', 'Riko Solari', '', '2020-01-01T00:00:00Z', 0, '');

-- freechat
