import { Livestream, Platform } from "@/types/streaming";

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const dayBeforeYesterday = new Date(today);
dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

const getRandomTimeSlot = (date: Date) => {
  const timeSlot = Math.floor(Math.random() * 4);
  const newDate = new Date(date);

  switch (timeSlot) {
    case 0:
      newDate.setHours(Math.floor(Math.random() * 6));
      break;
    case 1:
      newDate.setHours(Math.floor(Math.random() * 6) + 6);
      break;
    case 2:
      newDate.setHours(Math.floor(Math.random() * 6) + 12);
      break;
    case 3:
      newDate.setHours(Math.floor(Math.random() * 6) + 18);
      break;
    default:
      break;
  }

  return newDate.toISOString();
};

export const mockLiveStreams: Livestream[] = [
  {
    id: "4erE1DlBuvc",
    title: "【APEX】打倒【ぶいすぽ/一ノ瀬うるは】",
    description: "いらすと(@simpkingp) thank you!!",
    channelId: "UC5LyYg6cCA4yHEYvtUsir3g",
    channelTitle: "一ノ瀬うるは",
    thumbnailUrl: "https://i.ytimg.com/vi/4erE1DlBuvc/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(tomorrow),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/ytc/AL5GRJWkj0HzMoVUiZkmN6_YJEBigxHnTYbtiDRJjd6X=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "N1wBmWwT14c",
    title: "【 APEX 】カスタム侍【 ぶいすぽっ！ / 小森めと 】",
    description:
      "illustration : @o_lo3253 TY!! @uruhaichinose @Ibrahim @CR_uruca ...",
    channelId: "UCzUNASdzI4PV5SlqtYwAkKQ",
    channelTitle: "Met Channel / 小森めと ",
    thumbnailUrl: "https://i.ytimg.com/vi/N1wBmWwT14c/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(dayAfterTomorrow),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/oKj3QGssTroRn-2D7T3bqcDpYY2ha10PUx0aXRcQYRn8V1sAKvOJG4lTLUtuKYAeGMrevpcOYw=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "F8pqP6_-rCY",
    title:
      "【APEX】練習かすたむ❕3人揃うまで助っ人に馳せ参じ【ぶいすぽっ！/英リサ】",
    description:
      "FuraKanato @MakainoRirimu @YufuNachannel スナイプゴースティング対ありコメお控えいただける と嬉しいです 素敵なサムネ ...",
    channelId: "UCurEA8YoqFwimJcAuSHU0MQ",
    channelTitle: "英リサ.Hanabusa Lisa",
    thumbnailUrl: "https://i.ytimg.com/vi/F8pqP6_-rCY/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(yesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/ytc/AL5GRJVwBSjvk7DMgiAYgNIdmCkzyqr-D39VOuxZD95u=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "DZOx8LkBPag",
    title: "【APEX】今日もカスタムがんばるじょ【ぶいすぽ / 猫汰つな】",
    description:
      "lisahanabusa @tosakimimi3369 .｡:+* ﾟ ゜ﾟ *+:｡.｡:+* ﾟ ゜ﾟ *+:｡.｡.｡:+* ﾟ ゜ﾟ *+ 公式グッズ   https://lupinusvg.booth.pm/ グッズ、 ...",
    channelId: "UCIjdfjcSaEgdjwbgjxC3ZWg",
    channelTitle: "猫汰つな / Nekota Tsuna",
    thumbnailUrl: "https://i.ytimg.com/vi/DZOx8LkBPag/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(dayBeforeYesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/yf-cHSFj3-JXC8mz7FyIzTG2W_W_nAbCOr2TRzHzFUVBSCU047G2gfr7th5NitHidR20s5ov=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "YNvyABKLp6k",
    title: "【APEX】とりまーーーかすたむ【ぶいすぽ/花芽なずな】",
    description:
      "なずちゃんねる DPI 800 感度 0.339 ▽使用デバイス(パソコン) GALLERIA ZA9C-R37 【ぶいすぽっ！ × GALLERIAコラボPC発売 ...",
    channelId: "UCiMG6VdScBabPhJ1ZtaVmbw",
    channelTitle: "花芽なずな / Nazuna Kaga",
    thumbnailUrl: "https://i.ytimg.com/vi/YNvyABKLp6k/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/HsgFKOFi-dN8VTnvRLV276FwW5PMR7Ynjxf_Rg1eKt9djmlU9zJXiaMBr7Bg7n0HCX2qsx9D=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "Enwdy-4CMho",
    title:
      "【APEX】いまちーむええかんじやねん！！！！！！【ぶいすぽ/神成きゅぴ】",
    description:
      "サムネイルイラスト→ぞら まるた@marutA818 さん⚡ member @shinomiyaruna @HizakiGamma coach @Rinshan いっぱい ...",
    channelId: "UCMp55EbT_ZlqiMS3lCj01BQ",
    channelTitle: "神成きゅぴ / Kaminari Qpi",
    thumbnailUrl: "https://i.ytimg.com/vi/Enwdy-4CMho/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(tomorrow),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/83sEziNDVt1HoBeo4JXIBXjA3DMGCxxyCLmCig9nml-h7f5bPMvczmtgh8TQUqzaOEoc-0lFgg=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "o5TCl4u0WiE",
    title: "【APEX】🥳😎🤩🥶【ぶいすぽっ！/紫宮るな】",
    description:
      "メンバー敬称略 神成きゅぴ 緋崎ガンマ りんしゃんつかい 鬼かわのイラストは笹々 (@ssk_sasasa)さんありがとうございます！",
    channelId: "UCD5W21JqNMv_tV9nfjvF9sw",
    channelTitle: "紫宮るな /shinomiya runa",
    thumbnailUrl: "https://i.ytimg.com/vi/o5TCl4u0WiE/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(yesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/nHOf1h_guQXgrCw-E3rDcEKV2r8wvOUys7_3lrvKsDWu-Fbf5VT_mBwCNglvWpaNGonWWjmcdQ=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "n0XpwE9G36A",
    title: "【APEX 】即席ちーむでカスタム【ぶいすぽ/兎咲ミミ】",
    description:
      "素敵なイラスト ちしやなさん https://twitter.com/cheshirena3 Thank you! ぶいすぽ所属の兎咲 ミミです     ゲームをメインに配信 ...",
    channelId: "UCnvVG9RbOW3J6Ifqo-zKLiw",
    channelTitle: "兎咲ミミ / Tosaki Mimi",
    thumbnailUrl: "https://i.ytimg.com/vi/n0XpwE9G36A/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(dayBeforeYesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/q3SKZBWy8lyeSBcvjlo6E2lc9IeX6ZeIWp2wDMROGGfsjrkJCjGt7Nk2T1dAFhpHAl2wLl_A=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "vMfJ1VHG-Gg",
    title: "【 Apex Legends 】わっしょいカスタム【ぶいすぽっ！/橘ひなの】",
    description:
      "ㅤ〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰 memo @WataraiHibari @UzukiKou @Mondo2233 ...",
    channelId: "UCvUc0m317LWTTPZoBQV479A",
    channelTitle: "橘ひなの / Hinano Tachibana",
    thumbnailUrl: "https://i.ytimg.com/vi/vMfJ1VHG-Gg/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/pl2lGIkqUJlkc6Xn3ut4-NvhLAYYnxaMTBl7ap8bFK1mEQB2sHZYCykQ_eIg6ccwvnlb6npP9w=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "qF6kSZee8pQ",
    title: "【APEX】V最協練習カスタム💚【ぶいすぽ/八雲べに】",
    description:
      "º‧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈‧º·˚.✱ member @tsuna_nekota @TokoyamiTowa coach @cpt7164 illustration ...",
    channelId: "UCjXBuHmWkieBApgBhDuJMMQ",
    channelTitle: "八雲べに",
    thumbnailUrl: "https://i.ytimg.com/vi/qF6kSZee8pQ/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(yesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/TaSlDiG5kna6N97pSfFntREvdnSy5AOorOIvT7VxvD9CkG17nd1vWligkJVnhgqrIFHxa2-wZw=s176-c-k-c0x00ffffff-no-rj",
    platform: "twitcasting",
  },
  {
    id: "1781789441",
    title: "よろしくお願いしますフルパ w/!member",
    description: "",
    channelId: "858359149",
    channelTitle: "白波 らむね",
    thumbnailUrl:
      "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png",
    scheduledStartTime: getRandomTimeSlot(yesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/VykxxNIMhokn4vMohzwVp_xgM7TbviYrXFhGm8vzcJAlyz3zohSPSbnrfKehdDhprRk7R9XfRFI=s176-c-k-c0x00ffffff-no-rj",
    platform: "twitch",
  },
  {
    id: "",
    title: "よろしくお願いしますフルパ w/!member",
    description: "",
    channelId: "584184005",
    channelTitle: "濃いめのあかりん",
    thumbnailUrl:
      "https://play-lh.googleusercontent.com/QLQzL-MXtxKEDlbhrQCDw-REiDsA9glUH4m16syfar_KVLRXlzOhN7tmAceiPerv4Jg=w240-h480-rw",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/VykxxNIMhokn4vMohzwVp_xgM7TbviYrXFhGm8vzcJAlyz3zohSPSbnrfKehdDhprRk7R9XfRFI=s176-c-k-c0x00ffffff-no-rj",
    platform: "twitch",
    isTemp: true,
    tempUrl:
      "https://www.twitch.tv/akarindao/schedule?segmentID=61339298-e6c2-468f-81d8-89d8d3faab65",
  },
  {
    id: "1782478916",
    title: "ダイヤいく！！！！！！！！！！",
    description: "",
    channelId: "600770697",
    channelTitle: "胡桃のあ",
    thumbnailUrl:
      "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png",
    scheduledStartTime: getRandomTimeSlot(dayBeforeYesterday),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/kw0dKilTsam6dKpTQ0piEb04AgoB6DDXVgQNGJQV7Tg1Pt7mazr7tcEWMP4ovm3w9ZFlIXFpFw=s176-c-k-c0x00ffffff-no-rj",
    platform: "twitch",
  },
  {
    id: "IqQ0zDbNj-M",
    title:
      "【原神】#19 荒瀧一斗さん伝説任務～天ノ牛の章～と初視聴者参加型厳選【空澄セナ/ぶいすぽっ！】",
    description: "",
    channelId: "UCF_U2GCKHvDz52jWdizppIA",
    channelTitle: "空澄セナ",
    thumbnailUrl:
      "https://i.ytimg.com/vi/IqQ0zDbNj-M/hqdefault_live.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCgXa1gTnC0e-VvGb1rDAmKqhx54Q",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/7M4bq-eX19nDu1Mzf6RWdHSpyCNP1USrfJ2oTfWgCTiIv31G3-7Sbdf4QzTRemQiEYRTEE0L9g=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "_d0AHBgkgks",
    title:
      "【#花芽すみれ誕生日】今年も誕生日だ～～～～！！✨告知いっぱい【 ぶいすぽ 】",
    description:
      "イラスト：https://twitter.com/Parsley_F さんありがとう   ｡*⑅♱୨୧┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈୨୧♱⑅*｡ はじ めまして ...",
    channelId: "UCyLGcqYs7RsBb3L0SJfzGYA",
    channelTitle: "花芽すみれ",
    thumbnailUrl: "https://i.ytimg.com/vi/_d0AHBgkgks/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(dayAfterTomorrow),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/yfURgusjOeRXgE1WmQcy80txikMwQvrNZ762DOSrdRPJL4PoRKxVd3csZPFV0lsfaGCovRmdvQ=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "O0XCK3NhzqE",
    title:
      "【APEX】ランドマークは溶岩になった！！#三清傑WIN w/まつりちゃん,えるちゃん【ぶいすぽっ！/ 藍沢エマ】",
    description: "",
    channelId: "UCPkKpOHxEDcwmUAnRpIu-Ng",
    channelTitle: "藍沢エマ",
    thumbnailUrl:
      "https://i.ytimg.com/vi/O0XCK3NhzqE/hqdefault_live.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAJT-cOJp-wPv9EgyyO6KE_jAoYDg",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/oIps6UVvqtpJykcdjYYyRvhdcyVoR1wAdH8CnTp4msMaKYdn8XMLj4FHsLoqfWaJzbLJKSPjCg=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "SGY_6KAdOQs",
    title:
      "【雑】タイトルにこれ書こうって思いついたのに忘れた【ぶいすぽ/如月れん】",
    description:
      "使用デバイス(パソコン) GALLERIA ZA9C-R37 ======= ▷使用デバイス(パソコン) GALLERIA ZA9C-R37 【ぶいすぽっ！",
    channelId: "UCGWa1dMU_sDCaRQjdabsVgg",
    channelTitle: "如月れん -Ren kisaragi-",
    thumbnailUrl: "https://i.ytimg.com/vi/SGY_6KAdOQs/hqdefault_live.jpg",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/U2M8O-qwS0vrjAr7nYk9y58xAV-I80eRn1jn1MX6pmsGcMdtUhMmgRekSAun2ca2Db7ntFuwwQ=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
  {
    id: "SWoBlqokEMs",
    title:
      "【 Sons Of The Forest 】ちーたるふぉれすと２ #5【 ぶいすぽ / 小雀とと 】",
    description: "",
    channelId: "UCgTzsBI0DIRopMylJEDqnog",
    channelTitle: "小雀とと / Toto Kogara",
    thumbnailUrl:
      "https://i.ytimg.com/vi/SWoBlqokEMs/hqdefault_live.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAZvfGylqm2XaqEIXyA3tzc2FinpA",
    scheduledStartTime: getRandomTimeSlot(today),
    actualEndTime: "1998-01-01T12:00:00Z",
    iconUrl:
      "https://yt3.googleusercontent.com/ytc/AL5GRJXuaEZn-og4JbkC4QJvCtmhWfPrJlOUBYQMl1RA=s176-c-k-c0x00ffffff-no-rj",
    platform: "youtube",
  },
].map((stream) => ({ ...stream, platform: stream.platform as Platform }));
