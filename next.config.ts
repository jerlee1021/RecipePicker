import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type-check <Link href> against the routes in src/app, so a typo is a compile error, not a 404.
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
