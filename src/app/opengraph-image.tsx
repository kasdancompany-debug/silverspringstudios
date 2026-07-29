import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${SITE.name} — Independent film distribution`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(165deg, #12151a 0%, #090a0c 45%, #060708 100%)",
          color: "#F1EEE7",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#C4B8A8",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Silver Spring
          </div>
          <div style={{ fontSize: 36, letterSpacing: "0.32em", textTransform: "uppercase", color: "#9AA0A6" }}>
            Studios
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 64, lineHeight: 1.05 }}>{SITE.tagline}</div>
          <div style={{ fontSize: 28, color: "#9AA0A6", fontFamily: "Helvetica, Arial, sans-serif" }}>
            Boutique independent film distribution — selective partnerships, transparent terms.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
