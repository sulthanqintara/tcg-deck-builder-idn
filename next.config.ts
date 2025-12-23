import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "asia.pokemon-card.com",
      },
      {
        // Backwards compatibility for cached deck data
        protocol: "https",
        hostname: "assets.tcgdex.net",
      },
    ],
  },
};

export default nextConfig;
