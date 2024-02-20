import React from "react";
import styles from "@/styles/Terms.module.scss";
import { NextPageWithLayout } from "./_app";
import { ContentLayout } from "@/components/Layout/ContentLayout";
import { QA_LINK } from "@/lib/Const";

const PrivacyPolicy: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <h1>プライバシーポリシー</h1>
      <p>
        このプライバシーポリシーは，サービス提供者がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）のプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
      </p>

      <h2>第1条（プライバシー情報）</h2>
      <p>
        プライバシー情報のうち「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報を指します。
      </p>
      <p>
        プライバシー情報のうち「履歴情報および特性情報」とは，上記に定める「個人情報」以外のものをいい，ご利用いただいたサービスやご購入いただいた商品，ご覧になったページや広告の履歴，ユーザーが検索された検索キーワード，ご利用日時，ご利用の方法，ご利用環境，郵便番号や性別，職業，年齢，ユーザーのIPアドレス，クッキー情報，位置情報，端末の個体識別情報などを指します。
      </p>
      <h2>第2条（プライバシー情報の収集方法）</h2>
      <p>
        サービス提供者は，ユーザーについて，利用したサービスやソフトウエア,閲覧したページや広告の履歴，検索した検索キーワード，利用日時，利用方法，利用環境（携帯端末を通じてご利用の場合の当該端末の通信状態，利用に際しての各種設定情報なども含みます），IPアドレス，クッキー情報，位置情報，端末の個体識別情報などの履歴情報および特性情報を，ユーザーがページを閲覧する際に収集します。
      </p>

      <h2>第3条（個人情報を収集・利用する目的）</h2>
      <p>サービス提供者が個人情報を収集・利用する目的は，以下のとおりです。</p>
      <ol>
        <li>システムの安定稼働など、本サービスの維持・管理のための利用</li>
        <li>
          ユーザーのニーズ・興味・関心に合致したコンテンツの推奨のための利用
        </li>
        <li>広告効果測定等のための分析のための利用</li>
        <li>上記の利用目的に付随する目的</li>
      </ol>

      <h2>第4条（個人情報の第三者提供）</h2>
      <p>
        サービス提供者は，法令に基づく場合を除いて，あらかじめユーザーの同意を得ることなく，第三者に個人情報を提供することはありません。ただし，個人情報保護法その他の法令で認められる場合を除きます。
      </p>

      <h2>第5条（サードパーティのプライバシーポリシー）</h2>
      <p>
        本サービスでは、本サービスの改善のための分析、行動ターゲティング広告等の広告配信、コンテンツ配信を目的に、第三者サービスとして、Google
        Inc.（以下「Google」といいます。）が提供するGoogle
        Analytics、Google広告等（以下、これらの第三者サービスといいます。）を利用しています。
        これらの第三者サービスでは、Cookieを通じて利用状況の分析を行うことがありますが、この際、IPアドレス等のユーザー情報の一部が、これらの第三者サービスの運営会社に収集される可能性があります。利用者は、本サービスを利用することで、上記方法および目的においてこれらの第三者サービスの運営が行うデータ処理につき許可を与えたものとみなします。
      </p>
      <ol>
        <li>
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google広告のクッキーによる情報収集について
          </a>
        </li>
        <li>
          <a
            href="https://privacy.google.com/intl/ja/how-ads-work.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google広告が収集したデータの利用方法や、広告の表示先について
          </a>
        </li>
        <li>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googleが提供するサービスにおけるプライバシーポリシーについて
          </a>
        </li>
      </ol>
      <h2>第6条（プライバシーポリシーの変更）</h2>
      <ol>
        <li>
          本ポリシーの内容は，ユーザーに通知することなく，変更することができるものとします。
        </li>
        <li>
          サービス提供者が別途定める場合を除いて，変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。
        </li>
      </ol>
      <h2>第7条（お問い合わせ窓口）</h2>
      <p>
        本ポリシーに関するお問い合わせは，
        <a href={QA_LINK} target="_blank" rel="noopener noreferrer">
          お問い合わせ窓口
        </a>
        までお願いいたします。
      </p>
    </div>
  );
};

PrivacyPolicy.getLayout = (page) => {
  return (
    <ContentLayout
      title="プライバシーポリシー"
      description="本サイトを使用する上でのプライバシーポリシーです。"
      path="/privacy-policy"
      maxPageWidth="md"
      padTop
    >
      {page}
    </ContentLayout>
  );
};

export default PrivacyPolicy;
