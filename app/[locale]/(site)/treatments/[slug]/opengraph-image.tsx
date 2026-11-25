import { ImageResponse } from "next/og";
import { getTreatment } from "@/lib/content/loaders";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Derma World Skin & Hair Clinic";

/** Brand-styled share image per treatment. No medical claims. */
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTreatment(slug);
  const name = t?.name.en ?? "Skin & Hair Treatments";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #184d38 0%, #0f3025 100%)",
          color: "#ffffff",
          padding: 72,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 30, color: "#b2d4c0", letterSpacing: 4, textTransform: "uppercase" }}>Derma World Skin & Hair Clinic</div>
        <div style={{ fontSize: 76, lineHeight: 1.1, maxWidth: 1000 }}>{name}</div>
        <div style={{ fontSize: 30, color: "#d8eadf" }}>Moula Ali, near ECIL · Hyderabad</div>
      </div>
    ),
    size,
  );
}
