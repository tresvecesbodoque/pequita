import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Imagen que se muestra al compartir el enlace (WhatsApp, redes, etc.).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Una carta para ${SITE.recipientName}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6f1e7 0%, #efe4cf 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 10,
            color: "#8a7a6b",
            textTransform: "uppercase",
          }}
        >
          Para
        </div>
        <div style={{ fontSize: 140, color: "#a8324a", marginTop: 6 }}>
          {SITE.recipientName}
        </div>
        <div style={{ fontSize: 48, color: "#3a2e26", marginTop: 18 }}>
          {SITE.inviteTitle}
        </div>
        <div style={{ fontSize: 34, color: "#8a7a6b", marginTop: 40 }}>
          una carta escrita con cariño
        </div>
      </div>
    ),
    { ...size }
  );
}
