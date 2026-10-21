import Script from "next/script";

export function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (plausibleDomain) {
    return (
      <Script
        defer
        data-domain={plausibleDomain}
        src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}
        strategy="afterInteractive"
      />
    );
  }

  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
  if (umamiId && umamiSrc) {
    return <Script defer data-website-id={umamiId} src={umamiSrc} strategy="afterInteractive" />;
  }

  return null;
}
