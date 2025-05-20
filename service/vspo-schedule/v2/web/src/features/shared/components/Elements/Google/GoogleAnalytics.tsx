import { getCloudflareContext } from "@opennextjs/cloudflare";
import Script from "next/script";
import { FC } from "react";

export const GoogleAnalytics: FC = () => {
  if (getCloudflareContext().env.ENV !== "production") {
    return <></>;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${getCloudflareContext().env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${getCloudflareContext().env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
        `}
      </Script>
    </>
  );
};
