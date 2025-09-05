import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow Firebase Storage covers
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
    // If you still see loader warnings on Vercel, you can temporarily add:
    // unoptimized: true,
  },

  experimental: {
    // keep the Turbopack aliases so Next won't try to bundle node-canvas
    turbo: {
      resolveAlias: {
        canvas: path.resolve("./src/stubs/canvas.js"),
        "canvas/node": path.resolve("./src/stubs/canvas.js"),
      },
    },
  },

  // also add aliases for webpack (dev or when webpack is used)
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: path.resolve("./src/stubs/canvas.js"),
      "canvas/node": path.resolve("./src/stubs/canvas.js"),
    };
    // don't attempt to polyfill native modules
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
