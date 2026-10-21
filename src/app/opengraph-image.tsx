import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0e1b2c",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <svg width="120" height="120" viewBox="0 0 112 112">
          <rect width="112" height="112" rx="28" fill="#0f766e" />
          <path
            d="M22 34h30v16h18v16h20"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M90 68v10" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
          <circle cx="90" cy="90" r="5" fill="#f59e0b" />
        </svg>
        <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4 }}>{SITE_NAME}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 50, lineHeight: 1.2, maxWidth: 1040 }}>{`${SITE_TAGLINE}.`}</div>
        <div style={{ fontSize: 30, color: "#5eead4" }}>
          Curtailment eólico e solar no Brasil, mês a mês, com dados do ONS
        </div>
      </div>
    </div>,
    size,
  );
}
