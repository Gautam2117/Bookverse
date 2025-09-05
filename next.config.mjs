import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
    ],
  },

  // Turbopack (Next 15) alias
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: path.resolve("./src/stubs/canvas.js"),
        "canvas/node": path.resolve("./src/stubs/canvas.js"),
      },
    },
  },

  // Webpack alias (dev or if webpack is used)
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: path.resolve("./src/stubs/canvas.js"),
      "canvas/node": path.resolve("./src/stubs/canvas.js"),
    };
    // Don’t try to polyfill native modules
    config.resolve.fallback = { ...(config.resolve.fallback || {}), canvas: false };
    return config;
  },
};

export default nextConfig;
