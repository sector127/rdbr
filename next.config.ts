import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.redclass.redberryinternship.ge",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
