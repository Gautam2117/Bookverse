import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STUB = join(__dirname, "stubs", "canvas.js");

/** @type {import("next").NextConfig} */
export default {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
    ],
  },

  /* ----------  Turbopack  ---------- */
  turbopack: {
  },

  /* ----------  Webpack  ------------ */
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias = { ...(config.resolve.alias ?? {}), canvas: STUB };
    return config;
  },
};
