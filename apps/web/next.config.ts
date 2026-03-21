import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL ?? "http://api:4000"
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/auth/:path*`,
      },
      {
        source: "/api/graphql",
        destination: `${apiUrl}/graphql`,
      },
    ]
  },
}

export default nextConfig
