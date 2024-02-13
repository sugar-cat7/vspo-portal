import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}
export const GoogleAd: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {},
      );
    } catch (error) {
      console.error(error);
    }
  }, [pathname]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // height: "100vh",
        marginBottom: "80px",
        width: "100vw",
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minWidth: "100vw",
          maxHeight: "250px",
          margin: "16px",
        }}
        data-adtest={process.env.NODE_ENV === "development" ? "on" : "off"}
        data-ad-client={process.env.NEXT_PUBLIC_AD_CLIENT}
        data-ad-slot={process.env.NEXT_PUBLIC_AD_SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
};
