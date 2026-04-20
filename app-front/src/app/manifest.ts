import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Peixinhos de Cristo",
    short_name: "Peixinhos",
    description: "Gerenciamento de células",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2563EB",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
