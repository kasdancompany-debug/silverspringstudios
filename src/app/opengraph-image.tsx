import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

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
          padding: "64px 72px",
          background: "linear-gradient(180deg, #111 0%, #000 100%)",
          color: "#F3F1EA",
          fontFamily: "Impact, 'Arial Narrow', Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 0.88,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Silver Spring
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#FF2D6A",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Studios
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
          <div
            style={{
              fontSize: 52,
              lineHeight: 1.05,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              letterSpacing: "-0.01em",
              textTransform: "none",
            }}
          >
            {SITE.tagline}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#8E8E8A",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            Boutique independent film distribution — selective partnerships, transparent terms.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
