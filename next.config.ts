import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Fleet photos published by RideReserve on its current site.
    remotePatterns: [{ protocol: "https", hostname: "ridereservegh.com", pathname: "/wp-content/uploads/**" }],
  },
  // Preserve the current WordPress routes (see docs/DECISIONS.md → Routing).
  async redirects() {
    return [
      { source: "/rent-a-car", destination: "/rent", permanent: true },
      { source: "/vehicle-categories", destination: "/vehicles", permanent: true },
      { source: "/business-corporate-rental", destination: "/business", permanent: true },
      { source: "/my-booking", destination: "/manage-booking", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/help", permanent: true },
      { source: "/terms-and-conditions", destination: "/policies/terms", permanent: true },
      { source: "/self-drive-rental-agreement", destination: "/policies/self-drive-agreement", permanent: true },
      { source: "/ridereserve-chauffeur-driven-rental-agreement", destination: "/policies/chauffeur-agreement", permanent: true },
      { source: "/privacy-policy", destination: "/policies/privacy", permanent: true },
    ]
  },
}

export default nextConfig
