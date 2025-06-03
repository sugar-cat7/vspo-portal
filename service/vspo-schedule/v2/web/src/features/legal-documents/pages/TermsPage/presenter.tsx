import { AgreementDocument } from "@/features/shared/components/Templates";
import React from "react";

export const TermsPagePresenter: React.FC = () => {
  return (
    <AgreementDocument>
      <h1>利用規約</h1>
      <p>
        この利用規約（以下，「本規約」といいます。）は，サービス提供者がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めます。
      </p>

      <h2>第1条（適用）</h2>
      <p>
        本規約は，ユーザーとサービス提供者との間の本サービスの利用に関わる一切の関係に適用されるものとします。
      </p>

      <h2>第2条（禁止事項）</h2>
      <p>
        ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。
      </p>
      <ol>
        <li>法令または公序良俗に違反する行為</li>
        <li>犯罪行為に関連する行為</li>
        <li>サービス提供者のサービスの運営を妨害するおそれのある行為</li>
        <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
        <li>他のユーザーに成りすます行為</li>
        <li>
          サービス提供者のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
        </li>
        <li>
          サービス提供者，本サービスの他の利用者または第三者の知的財産権，肖像権，プライバシー，名誉その他の権利または利益を侵害する行為
        </li>
      </ol>

      <h2>第3条（本サービスの提供の停止等）</h2>
      <p>
        サービス提供者は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
      </p>
      <ol>
        <li>
          本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
        </li>
        <li>
          地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合
        </li>
        <li>コンピュータまたは通信回線等が事故により停止した場合</li>
        <li>その他，サービス提供者が本サービスの提供が困難と判断した場合</li>
      </ol>
      <p>
        サービス提供者は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害について，理由を問わず一切の責任を負わないものとします。
      </p>

      <h2>第4条（著作権）</h2>
      <p>全ての画像，映像等の著作権については，元の権利者に帰属されます。</p>

      <h2>第5条（保証の否認および免責事項）</h2>
      <p>
        サービス提供者は，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
      </p>
      <p>
        サービス提供者は，本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。
      </p>
      <h2>第6条（サードパーティの利用規約）</h2>
      <p>本サービスの運用にあたり、下記APIを使用しています。</p>
      <ul>
        <li>Google Inc.が提供するYouTubeAPI</li>
        <li>Twitch Interactive, Inc.が提供するTwitchAPI</li>
        <li>Moi Corp.(ツイキャス)が提供するTwitCastingAPI</li>
      </ul>
      <p>
        本サービスはおよび各APIを通じて取得した動画情報のうち、動画名、サムネイル、投稿日時を保存します。利用者は、本サービスを使用するにあたり、上記方法および目的において各APIのデータ処理につき、下記関連の利用規約に合意の上、許可を与えたものとみなします。
      </p>
      <ul>
        <li>
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube利用規約
          </a>
        </li>
        <li>
          <a
            href="https://developers.google.com/youtube/terms/developer-policies#definition-youtube-api-services"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube API利用規約
          </a>
        </li>
        <li>
          <a
            href="https://policies.google.com/privacy?hl=ja"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googleが提供するサービスにおけるプライバシーポリシーについて
          </a>
        </li>
        <li>
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google セキュリティ設定
          </a>
        </li>
        <li>
          <a
            href="https://www.twitch.tv/p/ja-jp/legal/terms-of-service/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitch利用規約
          </a>
        </li>
        <li>
          <a
            href="https://www.twitch.tv/p/ja-jp/legal/developer-agreement/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitch Developer Services Agreement
          </a>
        </li>
        <li>
          <a
            href="https://twitcasting.tv/indexlicense.php"
            target="_blank"
            rel="noopener noreferrer"
          >
            ツイキャス利用規約
          </a>
        </li>
        <li>
          <a
            href="https://twitcasting.tv/indexapi.php?lang=ja"
            target="_blank"
            rel="noopener noreferrer"
          >
            ツイキャス開発API利用規約
          </a>
        </li>
      </ul>
      <h2>第7条（サービス内容の変更等）</h2>
      <p>
        サービス提供者は，ユーザーに通知することなく，本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし，これによってユーザーに生じた損害について一切の責任を負いません。
      </p>

      <h2>第8条（利用規約の変更）</h2>
      <p>
        サービス提供者は，必要と判断した場合には，ユーザーに通知することなくいつでも本規約を変更することができるものとします。
      </p>

      <h2>第9条（通知または連絡）</h2>
      <p>
        ユーザーとサービス提供者との間の通知または連絡は，サービス提供者の定める方法によって行うものとします。
      </p>

      <h2>第10条（権利義務の譲渡の禁止）</h2>
      <p>
        ユーザーは，サービス提供者の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。
      </p>

      <h2>第11条（準拠法・裁判管轄）</h2>
      <p>本規約の解釈にあたっては，日本法を準拠法とします。</p>
      <p>
        本サービスに関して紛争が生じた場合には，サービス提供者の本店所在地を管轄する裁判所を専属的合意管轄とします。
      </p>
    </AgreementDocument>
  );
};