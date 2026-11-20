import type { MetadataRoute } from "next";

// Installable kiosk PWA. Set KIOSK_ORIENTATION=any to allow landscape.
export default function manifest(): MetadataRoute.Manifest {
  const orientation = (process.env.KIOSK_ORIENTATION ?? "portrait") as MetadataRoute.Manifest["orientation"];
  return {
    name: "Sterlixit Stand",
    short_name: "Sterlixit",
    description: "Free website health check and StaffMain demos from Sterlixit.",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation,
    background_color: "#F1F1EE",
    theme_color: "#F1F1EE",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
