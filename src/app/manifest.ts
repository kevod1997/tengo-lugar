import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tengo Lugar",
    short_name: "TengoLugar",
    description: "Encuentra tu viaje compartido",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6336C8",
    lang: "es",
    dir: "ltr",
    orientation: "portrait",
    scope: "/",
    categories: ["transportation", "travel"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
  }
}
