export const platforms = [
  { id: "youtube", name: "YouTube" },
  { id: "twitch", name: "Twitch" },
  { id: "twitcasting", name: "ツイキャス" },
  { id: "nicovideo", name: "ニコニコ動画" },
];

export const sideBarContents = [
  { id: "live", name: "配信中" },
  { id: "upcoming", name: "配信予定" },
  { id: "archieve", name: "アーカイブ" },
  { id: "freechat", name: "フリーチャット" },
  { id: "clip", name: "切り抜き一覧" },
  { id: "twitch-clip", name: "クリップ一覧" },
  { id: "about", name: "すぽじゅーるについて" },
  { id: "notification", name: "お知らせ" },
  { id: "qa", name: "お問い合わせ" },
  // { id: "support", name: "メッセージやご支援" },
];

export const bottomNavigationContents = [
  { id: "live", name: "配信中" },
  { id: "clip", name: "切り抜き" },
  { id: "twitch-clip", name: "クリップ" },
  { id: "event", name: "イベント" },
];

export const membersKeyWords = [
  {
    id: 1,
    name: "藍沢エマ",
    keywords: ["藍沢エマ"],
  },
  {
    id: 2,
    name: "空澄セナ",
    keywords: ["空澄セナ"],
  },
  {
    id: 3,
    name: "一ノ瀬うるは",
    keywords: ["一ノ瀬うるは"],
  },
  {
    id: 4,
    name: "花芽すみれ",
    keywords: ["花芽すみれ"],
  },
  {
    id: 5,
    name: "花芽なずな",
    keywords: ["花芽なずな"],
  },
  {
    id: 6,
    name: "神成きゅぴ",
    keywords: ["神成きゅぴ"],
  },
  {
    id: 7,
    name: "如月れん",
    keywords: ["如月れん"],
  },
  {
    id: 8,
    name: "胡桃のあ",
    keywords: ["胡桃のあ"],
  },
  {
    id: 9,
    name: "小雀とと",
    keywords: ["小雀とと"],
  },
  {
    id: 10,
    name: "小森めと",
    keywords: ["小森めと"],
  },
  {
    id: 11,
    name: "紫宮るな",
    keywords: ["紫宮るな"],
  },
  {
    id: 12,
    name: "白波 らむね",
    keywords: ["白波らむね"],
  },
  {
    id: 13,
    name: "橘ひなの",
    keywords: ["橘ひなの"],
  },
  {
    id: 14,
    name: "兎咲 ミミ",
    keywords: ["兎咲ミミ"],
  },
  {
    id: 15,
    name: "猫汰 つな",
    keywords: ["猫汰つな"],
  },
  {
    id: 16,
    name: "英リサ",
    keywords: ["英リサ"],
  },
  {
    id: 17,
    name: "八雲べに",
    keywords: ["八雲べに"],
  },
  {
    id: 18,
    name: "夢野あかり",
    keywords: ["夢野あかり"],
  },
];

export const timeframes = [
  { label: "1日", value: "1day" },
  { label: "1週間", value: "1week" },
  { label: "1ヶ月", value: "1month" },
  // { label: "3ヶ月", value: "all" },
];

export const sampleKeywords = [
  "おれあぽ",
  "ニチアサ",
  "Apex",
  "Valorant",
  "雑談",
];

export const freeChatVideoIds = [
  "tFFq_vUblrs",
  "Rfuu2gkj18w",
  "bx1-cTN0Zas",
  "HC8rMmTWBGk",
  "lSvLABLEhO0",
  "CIRvsQ7XMoM",
  "RasCgfRnTOc",
  "l4_7qk5VE50",
  "7-rmkxy7SSg",
  "uZduRVQgZgo",
  "JkuHbeoqu64",
  "Fs4QLxzm-Fc",
  "pT6aeI5S1Kk",
  "sKJ5moF3X8Y",
  "7-rmkxy7SSg",
];

export const aboutSections = [
  {
    title: "本サイトの概要",
    content: `すぽじゅーる (以下、当サイトと言います) は、「ぶいすぽっ!」の配信、切り抜き動画、イベント情報を紹介する非公式ファンサイトです。
    ※メンバー限定配信は掲載しておりません。

    本サイトは個人が運営しているため、お問い合わせへの回答や機能追加が遅れる可能性があります。

    掲載されている広告等で得た収益は全て本サイトの運営(サーバ代等)に使用されております。
    メッセージや本サイト改善のためのご支援をいただけるという方は下記のOFUSEからお願いいたします。
    [OFUSE](https://ofuse.me/d202a56f)
    `,
  },
  {
    title: "コンテンツについて",
    content: `
    ①配信一覧ページ
    ぶいすぽっ!メンバーの「配信」が掲載されているページです。
    「ライブ中の動画」がYouTubeに掲載されてから、約「1～5分後」に当サイトに掲載されます。
    ページを更新すると最新情報が表示されます。

    ![image](/about/page/live.png)

    ②切り抜きページ
    ぶいすぽっ!メンバーに関連する切り抜き動画掲載しています。※1,2
    ※1.許諾番号の記載があるもののみ掲載しています。
    ※2.最大直近一ヶ月の切り抜きを表示することができます。

    ![image](/about/page/clips.png)

    ③クリップページ
    ぶいすぽっ!メンバーに関連するTwitchのクリップを掲載しています。※1,2
    ※1.フィルタリングのため一定以上の再生数があるクリップのみを掲載しています。
    ※2.最大直近一ヶ月の切り抜きを表示することができます。

    ![image](/about/page/twitch-clips.png)

    ④フリーチャットページ
    ぶいすぽっ!メンバーの「フリーチャット枠」一覧のページです。

    ![image](/about/page/freechat.png)

    ⑤イベントページ
    ぶいすぽっ!メンバーの「イベント」一覧のページです。
    公式のイベントや外部大会への出場日時などを掲載しています。

    ![image](/about/page/events.png)

    ⑥お知らせ枠ページ
    当サイトのコンテンツに関するアップデートの情報を掲載しています。

    ![image](/about/page/notifications.png)
    `,
  },
  {
    title: "リンクやスクショについて",
    content: `当サイトは全ページ「リンクフリー」となっています。
    ただし、下記に記載す内容の場合はリンクを禁止します。
    ・リンク元のホームページに違法な内容が含まれている場合。
    ・リンク元のホームページの一部に見えるように、当サイトのコンテンツを表示している場合 (フレームを利用したリンクなど) 。
    ・当サイトのスクリーンショットや内容を引用される場合は、必ず当サイトのトップページ又は引用したページのURLを記載していただくようお願いします。`,
  },
  {
    title: "各種データについて",
    content: `当サイトで紹介している「動画やサムネイル情報」をプログラム等を用いて機械的に取得する行為 (Webスクレイピング行為等) は禁止しています。
    「動画やサムネイル情報」が必要な方は、必ずサービス提供元 (YouTube,Twitch,Twitterなど)の「API」を使用して取得していただくようお願い致します。
    詳細はサービス提供元の利用規約をご一読してください。`,
  },

  {
    title: "便利機能について",
    content: `① ダークモード切替
    サイドバーの「設定」をタップすると「ダークモード」と「ライトモード」の切替ができます。
    サイトに「再度アクセス」した際もモードは維持されます。

    ![image](/about/darkmode.png)

    ② ページ更新時間
    一部の対応ページでは、サイト下部に「最新更新日時」が表示されます。

    ![image](/about/update.png)

    ③ 動画の絞り込みについて
    配信や切り抜き一覧のページでは、右下の虫メガネアイコンをタップすると様々な検索条件で絞り込むことができます。
    特定のメンバー、公開日時などを組み合わせた複数検索にも対応しています。

    ![image](/about/filter.png)

    ④動画一覧のリンク
    「動画サムネイル」「動画タイトル」をタップするとYouTubeの概要が表示されます。
    Youtubeで視聴または、すぽじゅーる内でそのまま再生することが可能です。

    ![image](/about/link.png)

    ⑤PWAへの対応
    当サイトはPWAに対応しており、お手元の端末にインストールすることができます。
    ・Androidの場合
    ![image](/about/pwa-android.png)

    ・iOSの場合
    ![image](/about/pwa-ios.png)
    `,
  },
];
