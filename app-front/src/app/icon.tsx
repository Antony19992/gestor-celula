import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2563EB",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "112px",
        }}
      >
        {/* Cruz */}
        <div
          style={{
            position: "relative",
            width: "220px",
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "44px",
              height: "220px",
              background: "white",
              borderRadius: "22px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "220px",
              height: "44px",
              background: "white",
              borderRadius: "22px",
              top: "48px",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
