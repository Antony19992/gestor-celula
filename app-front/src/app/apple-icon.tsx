import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "80px",
              background: "white",
              borderRadius: "8px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "80px",
              height: "16px",
              background: "white",
              borderRadius: "8px",
              top: "17px",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
